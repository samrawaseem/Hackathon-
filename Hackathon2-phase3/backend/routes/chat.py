"""
Chat API routes using FastAPI for the AI Todo Chatbot.

This module implements the chat endpoint that processes natural language
requests and returns AI-generated responses.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import uuid

from ai_agents.chat_agent import create_chat_agent, ChatAgentRunner
from dependencies import validate_user_id_path
from db import get_session
from models import Conversation, Message, User


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None  # Can be None for new conversations
    model: Optional[str] = "gemini-1.5-flash"


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    message_id: str
    success: bool


# Create router
router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_with_agent(
    user_id: str = Depends(validate_user_id_path),
    chat_request: ChatRequest = None,
    session: Session = Depends(get_session)
) -> ChatResponse:
    """
    Chat endpoint that processes natural language requests and returns AI responses.

    Args:
        user_id: The ID of the authenticated user
        chat_request: The user's message and conversation context
        session: Database session for persistence

    Returns:
        ChatResponse with the AI's response
    """
    try:
        # Validate user_id format
        try:
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )

        # Verify user exists
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Sanitize and validate the request
        if not chat_request or not chat_request.message or not chat_request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required"
            )

        message_text = chat_request.message.strip()
        conversation_id = chat_request.conversation_id

        # Get or create conversation
        if conversation_id:
            try:
                conv = session.get(Conversation, conversation_id)
                if not conv or conv.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Conversation not found"
                    )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid conversation ID"
                )
        else:
            # Create new conversation
            conv = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=message_text[:50] if len(message_text) > 50 else message_text
            )
            session.add(conv)
            session.commit()
            conversation_id = conv.id

        # Get conversation history
        history_msgs = []
        if conversation_id:
            # Fetch last 10 messages
            msgs = session.exec(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.sequence_number.desc())
                .limit(10)
            ).all()
            # Reverse to chronological order
            msgs.reverse()
            history_msgs = [{"role": m.role, "content": m.content} for m in msgs]

        # Create and run agent
        try:
            selected_model = chat_request.model or "gemini-1.5-flash"
            agent = create_chat_agent(user_id, model_name=selected_model)
            response_data = await ChatAgentRunner.process_message(agent, message_text, history_msgs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            response_data = {
                "response": f"I encountered an error processing your request: {str(e)}",
                "task_operations": [],
                "metadata": {"error": str(e)}
            }

        # Get the next sequence number by counting existing messages
        existing_message_count = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
        ).all()
        next_sequence = len(existing_message_count)

        # Store user message
        user_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="user",
            content=message_text,
            sequence_number=next_sequence
        )
        session.add(user_msg)
        session.commit()

        # Store AI response
        ai_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="assistant",
            content=response_data.get("response", ""),
            sequence_number=next_sequence + 1
        )
        session.add(ai_msg)
        session.commit()

        return ChatResponse(
            response=response_data.get("response", ""),
            conversation_id=str(conversation_id),
            message_id=str(ai_msg.id),
            success=True
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/{user_id}/conversations", response_model=List[Dict[str, Any]])
def get_user_conversations(
    user_id: str = Depends(validate_user_id_path),
    session: Session = Depends(get_session)
):
    """
    Get all conversations for a user.
    """
    # Verify user exists
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    statement = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.created_at.desc())
    conversations = session.exec(statement).all()
    
    return [
        {
            "conversation_id": c.id,
            "title": c.title,
            "created_at": c.created_at
        }
        for c in conversations
    ]

@router.post("/{user_id}/conversations", response_model=Dict[str, Any])
def create_conversation(
    user_id: str = Depends(validate_user_id_path),
    session: Session = Depends(get_session)
):
    """
    Create a new conversation.
    """
    # Verify user exists
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="New Conversation"
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    
    return {
        "conversation_id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at
    }

@router.get("/{user_id}/conversations/{conversation_id}/messages", response_model=List[Dict[str, Any]])
def get_conversation_messages(
    conversation_id: str,
    user_id: str = Depends(validate_user_id_path),
    session: Session = Depends(get_session)
):
    """
    Get messages for a specific conversation.
    """
    # Verify user exists
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Verify conversation belongs to user
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
        
    statement = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.sequence_number.asc())
    messages = session.exec(statement).all()
    
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at
        }
        for m in messages
    ]

@router.delete("/{user_id}/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(validate_user_id_path),
    session: Session = Depends(get_session)
):
    """
    Delete a specific conversation and its messages.
    """
    # Verify user exists
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Verify conversation belongs to user
    conversation = session.get(Conversation, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
        
    session.delete(conversation)
    session.commit()
    
    return {"message": "Conversation deleted successfully"}