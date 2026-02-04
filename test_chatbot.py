import pytest
import json
import os
import tempfile
from unittest.mock import patch, MagicMock
from app import app, load_conversation_history, save_conversation_history, is_pure_tamil, clean_tamil_response

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def temp_data_dir():
    """Create a temporary directory for test data"""
    with tempfile.TemporaryDirectory() as temp_dir:
        original_data_dir = 'data'
        # Mock the data directory for tests
        with patch('app.os.makedirs'):
            yield temp_dir

class TestChatbotAPI:
    
    def test_chat_endpoint_success(self, client):
        """Test successful chat request"""
        with patch('app.client.chat.completions.create') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "Hello! How can I help you today?"
            mock_openai.return_value = mock_response
            
            response = client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'Hello',
                'context': [],
                'language': 'en-US'
            })
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'reply' in data
            assert data['reply'] == "Hello! How can I help you today?"

    def test_chat_endpoint_tamil_response(self, client):
        """Test Tamil language response"""
        with patch('app.client.chat.completions.create') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "வணக்கம்! உங்களுக்கு எப்படி உதவ முடியும்?"
            mock_openai.return_value = mock_response
            
            response = client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'வணக்கம்',
                'context': [],
                'language': 'ta-IN'
            })
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'reply' in data

    def test_chat_endpoint_crisis_detection(self, client):
        """Test crisis keyword detection"""
        response = client.post('/api/chat', json={
            'user_id': 'test_user',
            'message': 'I want to kill myself',
            'context': [],
            'language': 'en-US'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reply' in data
        assert 'important' in data['reply'].lower()

    def test_chat_endpoint_depression_detection(self, client):
        """Test depression keyword detection"""
        response = client.post('/api/chat', json={
            'user_id': 'test_user',
            'message': 'I am feeling depressed',
            'context': [],
            'language': 'en-US'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'reply' in data
        assert 'mental health' in data['reply'].lower()

    def test_chat_endpoint_missing_data(self, client):
        """Test chat endpoint with missing data"""
        response = client.post('/api/chat', json={})
        
        assert response.status_code == 200  # Should still work with defaults

    def test_chat_endpoint_openai_error(self, client):
        """Test handling of OpenAI API errors"""
        with patch('app.client.chat.completions.create') as mock_openai:
            mock_openai.side_effect = Exception("API Error")
            
            response = client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'Hello',
                'context': [],
                'language': 'en-US'
            })
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'reply' in data
            assert 'error' in data['reply'].lower()

class TestUtilityFunctions:
    
    def test_is_pure_tamil_valid(self):
        """Test Tamil text validation with valid Tamil"""
        assert is_pure_tamil("வணக்கம்") == True
        assert is_pure_tamil("நன்றி") == True
        assert is_pure_tamil("வணக்கம், நன்றி!") == True

    def test_is_pure_tamil_invalid(self):
        """Test Tamil text validation with invalid text"""
        assert is_pure_tamil("Hello") == False
        assert is_pure_tamil("வணக்கம் Hello") == False
        assert is_pure_tamil("123") == False

    def test_clean_tamil_response(self):
        """Test Tamil response cleaning"""
        dirty_text = "வணக்கம் Hello நன்றி 123"
        cleaned = clean_tamil_response(dirty_text)
        assert "Hello" not in cleaned
        assert "123" not in cleaned
        assert "வணக்கம்" in cleaned
        assert "நன்றி" in cleaned

    def test_conversation_history_functions(self, temp_data_dir):
        """Test conversation history loading and saving"""
        user_id = 'test_user_123'
        test_history = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ]
        
        # Test saving
        save_conversation_history(user_id, test_history)
        
        # Test loading
        loaded_history = load_conversation_history(user_id)
        assert loaded_history == test_history

    def test_conversation_history_file_not_found(self, temp_data_dir):
        """Test loading conversation history when file doesn't exist"""
        history = load_conversation_history('nonexistent_user')
        assert history == []

class TestLanguageDetection:
    
    def test_english_message_detection(self, client):
        """Test English message detection"""
        with patch('app.client.chat.completions.create') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "Hello! How can I help you?"
            mock_openai.return_value = mock_response
            
            response = client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'Hello, I need help',
                'context': [],
                'language': 'en-US'
            })
            
            assert response.status_code == 200

    def test_tamil_message_detection(self, client):
        """Test Tamil message detection"""
        with patch('app.client.chat.completions.create') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "வணக்கம்! உங்களுக்கு எப்படி உதவ முடியும்?"
            mock_openai.return_value = mock_response
            
            response = client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'வணக்கம், எனக்கு உதவி தேவை',
                'context': [],
                'language': 'ta-IN'
            })
            
            assert response.status_code == 200

class TestContextHandling:
    
    def test_context_preservation(self, client):
        """Test that conversation context is preserved"""
        with patch('app.client.chat.completions.create') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "I remember you mentioned sleep issues."
            mock_openai.return_value = mock_response
            
            # First message
            client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'I have trouble sleeping',
                'context': [],
                'language': 'en-US'
            })
            
            # Second message
            response = client.post('/api/chat', json={
                'user_id': 'test_user',
                'message': 'What should I do?',
                'context': [],
                'language': 'en-US'
            })
            
            assert response.status_code == 200

if __name__ == '__main__':
    pytest.main([__file__])
