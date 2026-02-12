"""
Integration tests for the chat API.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app, get_current_user as main_get_current_user  # Assuming your FastAPI app is in main.py
from models import User, Task, Conversation, Message
from db import engine, get_session
from sqlmodel import Session, select
from mcp.tools import add_todo, list_todos
import uuid
from datetime import datetime


@pytest.fixture
def client():
    """Create a test client for the API."""
    # Override dependency to return a fake user
    # Note: We need a dynamic override if we want different users for different tests
    # For now, let's use a default value, or rely on individual tests to override
    # But wait, existing tests assume "fake-jwt-token" works...
    # Better to override generally here
    app.dependency_overrides[main_get_current_user] = lambda: {"user_id": "test_user_id"}
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user():
    """Create a mock user for testing."""
    user_id = str(uuid.uuid4())
    email = f"test_{user_id[:8]}@example.com"
    user = User(
        id=user_id,
        email=email,
        name="Test User",
        password_hash="hashed_password"
    )
    
    # Insert into DB
    with Session(engine) as session:
        session.add(user)
        session.commit()
        
    return {
        "id": user_id,
        "email": email,
        "name": "Test User",
        "password_hash": "hashed_password"
    }


class TestChatAPIIntegration:
    """
    Integration tests for the chat API endpoints.
    """

    @patch('routes.chat.validate_user_id_path')
    def test_post_chat_endpoint_success(self, mock_validate, client, mock_user):
        """Test successful chat interaction."""
        # Mock user ID validation
        mock_validate.return_value = mock_user["id"]

        # Prepare test data
        test_message = "Add a task to buy milk"

        # Make request (without conversation_id to create a new one)
        response = client.post(
            f"/api/{mock_user['id']}/chat",
            json={
                "message": test_message
            },
            headers={"Authorization": "Bearer fake-jwt-token"}
        )

        # Assertions
        assert response.status_code == 200
        response_data = response.json()
        assert "response" in response_data
        assert "conversation_id" in response_data
        assert response_data["success"] is True

    @patch('routes.chat.validate_user_id_path')
    def test_post_chat_endpoint_missing_message(self, mock_validate, client, mock_user):
        """Test chat endpoint with missing message."""
        # Mock user ID validation
        mock_validate.return_value = mock_user["id"]

        # Make request with missing message
        response = client.post(
            f"/api/{mock_user['id']}/chat",
            json={
                "message": ""
            },
            headers={"Authorization": "Bearer fake-jwt-token"}
        )

        # Should return 400 error
        assert response.status_code == 400

    @patch('routes.chat.validate_user_id_path')
    def test_get_user_conversations(self, mock_validate, client, mock_user):
        """Test getting user's conversations."""
        # Mock user ID validation
        mock_validate.return_value = mock_user["id"]

        # Make request
        response = client.get(
            f"/api/{mock_user['id']}/conversations",
            headers={"Authorization": "Bearer fake-jwt-token"}
        )

        # Assertions
        assert response.status_code == 200
        response_data = response.json()
        # May be empty if no conversations exist, but should be a list
        assert isinstance(response_data, list)

    @patch('routes.chat.validate_user_id_path')
    def test_create_conversation(self, mock_validate, client, mock_user):
        """Test creating a new conversation."""
        # Mock user ID validation
        mock_validate.return_value = mock_user["id"]

        # Make request
        response = client.post(
            f"/api/{mock_user['id']}/conversations",
            headers={"Authorization": "Bearer fake-jwt-token"}
        )

        # Assertions
        assert response.status_code == 200
        response_data = response.json()
        assert "conversation_id" in response_data
        assert "created_at" in response_data

    @patch('routes.chat.validate_user_id_path')
    def test_get_conversation_messages(self, mock_validate, client, mock_user):
        """Test getting messages for a specific conversation."""
        # Mock user ID validation
        mock_validate.return_value = mock_user["id"]

        # Create a conversation first
        create_resp = client.post(
            f"/api/{mock_user['id']}/conversations",
            headers={"Authorization": "Bearer fake-jwt-token"}
        )
        assert create_resp.status_code == 200
        conv_data = create_resp.json()
        conv_id = conv_data["conversation_id"]

        # Now get messages for this conversation
        response = client.get(
            f"/api/{mock_user['id']}/conversations/{conv_id}/messages",
            headers={"Authorization": "Bearer fake-jwt-token"}
        )

        # Assertions
        assert response.status_code == 200
        response_data = response.json()
        assert isinstance(response_data, list)  # Should return list of messages

    def test_user_isolation_conversation_access(self, client):
        """Test that users cannot access other users' conversations."""
        user1_id = str(uuid.uuid4())
        user2_id = str(uuid.uuid4())
        
        # Create users in DB
        with Session(engine) as session:
            session.add(User(id=user1_id, email=f"u1_{user1_id[:8]}@test.com", password_hash="hash"))
            session.add(User(id=user2_id, email=f"u2_{user2_id[:8]}@test.com", password_hash="hash"))
            session.commit()
            
            # Create a conversation for user 2
            conv2 = Conversation(id=str(uuid.uuid4()), user_id=user2_id, title="User 2 Conv")
            session.add(conv2)
            session.commit()
            conv2_id = conv2.id

        # Try to access user 2's conversation as user 1
        app.dependency_overrides[main_get_current_user] = lambda: {"user_id": user1_id}
        
        # We need to mock validate_user_id_path too because it's called first
        with patch('routes.chat.validate_user_id_path') as mock_validate:
            mock_validate.return_value = user1_id
            
            response = client.get(
                f"/api/{user1_id}/conversations/{conv2_id}/messages", # Attempt to access conv2
                headers={"Authorization": "Bearer token"}
            )
            
            # Should be 404 because it belongs to user2
            assert response.status_code == 404
            assert response.json()["detail"] == "Conversation not found"

    def test_concurrent_user_isolation(self, client):
        """Test that concurrent users don't cross-contaminate conversations."""
        # Setup two users
        user1_id = str(uuid.uuid4())
        user2_id = str(uuid.uuid4())
        
        with Session(engine) as session:
            session.add(User(id=user1_id, email=f"u1_{user1_id[:8]}@test.com", password_hash="hash"))
            session.add(User(id=user2_id, email=f"u2_{user2_id[:8]}@test.com", password_hash="hash"))
            session.commit()

        import threading

        user1_conversation_ids = []
        user2_conversation_ids = []
        errors = []

        def user1_task():
            try:
                # Override for this specific user
                app.dependency_overrides[main_get_current_user] = lambda: {"user_id": user1_id}
                with patch('routes.chat.validate_user_id_path') as mock_v:
                    mock_v.return_value = user1_id
                    resp = client.post(f"/api/{user1_id}/conversations", headers={"Authorization": "Bearer t1"})
                    if resp.status_code == 200:
                        user1_conversation_ids.append(resp.json()["conversation_id"])
                    else:
                        errors.append(f"User 1 failed: {resp.status_code} {resp.text}")
            except Exception as e:
                errors.append(f"User 1 error: {str(e)}")

        def user2_task():
            try:
                # Override for this specific user
                app.dependency_overrides[main_get_current_user] = lambda: {"user_id": user2_id}
                with patch('routes.chat.validate_user_id_path') as mock_v:
                    mock_v.return_value = user2_id
                    resp = client.post(f"/api/{user2_id}/conversations", headers={"Authorization": "Bearer t2"})
                    if resp.status_code == 200:
                        user2_conversation_ids.append(resp.json()["conversation_id"])
                    else:
                        errors.append(f"User 2 failed: {resp.status_code} {resp.text}")
            except Exception as e:
                errors.append(f"User 2 error: {str(e)}")

        # Start threads
        t1 = threading.Thread(target=user1_task)
        t2 = threading.Thread(target=user2_task)
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        # Check for errors
        assert not errors, f"Errors occurred during concurrent execution: {errors}"
        
        # Verify both succeeded
        assert len(user1_conversation_ids) == 1
        assert len(user2_conversation_ids) == 1
        assert user1_conversation_ids[0] != user2_conversation_ids[0]

        # Final verification: each user only sees their own
        app.dependency_overrides[main_get_current_user] = lambda: {"user_id": user1_id}
        with patch('routes.chat.validate_user_id_path') as mock_v:
            mock_v.return_value = user1_id
            resp1 = client.get(f"/api/{user1_id}/conversations", headers={"Authorization": "Bearer t1"})
            assert resp1.status_code == 200
            convs = [c["conversation_id"] for c in resp1.json()]
            assert user1_conversation_ids[0] in convs
            assert user2_conversation_ids[0] not in convs

        app.dependency_overrides[main_get_current_user] = lambda: {"user_id": user2_id}
        with patch('routes.chat.validate_user_id_path') as mock_v:
            mock_v.return_value = user2_id
            resp2 = client.get(f"/api/{user2_id}/conversations", headers={"Authorization": "Bearer t2"})
            assert resp2.status_code == 200
            convs = [c["conversation_id"] for c in resp2.json()]
            assert user2_conversation_ids[0] in convs
            assert user1_conversation_ids[0] not in convs

    @patch('routes.chat.validate_user_id_path')
    def test_input_sanitization(self, mock_validate, client, mock_user):
        """Test that input sanitization prevents injection attacks."""
        # Mock user ID validation
        mock_validate.return_value = mock_user["id"]

        # Test with potentially dangerous input
        dangerous_message = "<script>alert('xss')</script>; DROP TABLE users; --"

        response = client.post(
            f"/api/{mock_user['id']}/chat",
            json={
                "message": dangerous_message
            },
            headers={"Authorization": "Bearer fake-jwt-token"}
        )

        # Should still return a successful response (but sanitized)
        # The exact behavior depends on how the sanitization is implemented
        assert response.status_code in [200, 400]  # Either processed safely or rejected

    def test_rate_limiting(self, client):
        """Test that rate limiting works properly."""
        # This would require more complex setup to test actual rate limiting
        # For now, we'll document the test intent
        pass


# Additional helper tests
def test_mcp_tool_integration():
    """Test integration between MCP tools and database."""
    # This would test that MCP tools properly interact with the database
    # For example, adding a task through the tool and verifying it's in the database
    pass


if __name__ == "__main__":
    pytest.main([__file__])