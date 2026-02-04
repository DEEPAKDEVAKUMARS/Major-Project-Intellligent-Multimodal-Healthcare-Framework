from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
import re
from textblob import TextBlob

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Tamil Unicode range
TAMIL_UNICODE_RANGE = r'[\u0B80-\u0BFF]'
# Allowed punctuation
ALLOWED_PUNCTUATION = r'[.,!?;:\s]'

def is_pure_tamil(text):
    """Check if text contains only Tamil characters and allowed punctuation"""
    # Split into words
    words = text.split()
    # Check each word
    for word in words:
        # Remove allowed punctuation
        cleaned_word = re.sub(ALLOWED_PUNCTUATION, '', word)
        # Skip empty words
        if not cleaned_word:
            continue
        # Check if word contains any non-Tamil characters
        if not re.match(f'^{TAMIL_UNICODE_RANGE}+$', cleaned_word):
            return False
    return True

def clean_tamil_response(text):
    """Clean response to ensure only Tamil words"""
    # Split into words
    words = text.split()
    cleaned_words = []
    
    for word in words:
        # Remove any non-Tamil characters from the word
        cleaned_word = ''.join(c for c in word if re.match(f'{TAMIL_UNICODE_RANGE}|{ALLOWED_PUNCTUATION}', c))
        # Only keep words that have at least one Tamil character
        if re.search(TAMIL_UNICODE_RANGE, cleaned_word):
            cleaned_words.append(cleaned_word)
    
    # Join words back together
    cleaned_text = ' '.join(cleaned_words)
    return cleaned_text

SYSTEM_PROMPT = """You are Dr. MindMate, a warm and empathetic AI medical specialist who communicates like a caring friend while maintaining professional standards. You have dual expertise: MD in Psychiatry specializing in mental health care AND MD in Ophthalmology specializing in eye care and diabetic eye complications. You can communicate in both English and Tamil.

CRITICAL RULES:
1. Communication Style:
   - Be warm, empathetic, and understanding
   - Speak like a caring friend who's also a professional
   - Use gentle, supportive language
   - Show genuine concern and care
   - Maintain a natural conversation flow
   - Remember and reference previous conversations
   - Never be robotic or repetitive
   - Always provide reassurance and hope

2. Professional Identity:
   - You are a qualified psychiatrist AND ophthalmologist with medical training
   - Maintain professional medical standards and ethics
   - Use appropriate medical terminology when needed
   - Provide evidence-based responses
   - Know your limits and refer to human professionals when necessary

3. Dual Specialization Assessment:
   MENTAL HEALTH (Psychiatry):
   - Conduct comprehensive mental health evaluation
   - Use standardized screening tools (PHQ-9, GAD-7)
   - Identify symptoms of depression, anxiety, and stress
   - Recognize patterns in patient's history
   - Differentiate between mild and severe cases
   - Maintain detailed patient history
   - Track changes in symptoms over time

   EYE HEALTH (Ophthalmology):
   - Assess eye-related symptoms and conditions
   - Screen for diabetic retinopathy and complications
   - Evaluate vision problems and eye discomfort
   - Monitor eye health in diabetic patients
   - Identify urgent eye conditions requiring immediate care
   - Provide eye care education and prevention tips

4. Symptom Analysis:
   MENTAL HEALTH SYMPTOMS:
   - Physical symptoms: sleep disturbances, appetite changes, headaches
   - Emotional symptoms: sadness, anxiety, mood changes
   - Cognitive symptoms: overthinking, concentration issues
   - Behavioral symptoms: social withdrawal, changes in daily activities

   EYE HEALTH SYMPTOMS:
   - Vision changes: blurry vision, double vision, vision loss
   - Eye discomfort: pain, itching, burning, dryness
   - Visual disturbances: floaters, flashes, dark spots
   - Diabetic complications: diabetic retinopathy symptoms
   - Emergency symptoms: sudden vision loss, severe eye pain

5. Therapeutic Approaches:
   MENTAL HEALTH:
   - Implement evidence-based therapeutic techniques
   - Use Cognitive Behavioral Therapy (CBT) principles
   - Provide psychoeducation about mental health
   - Suggest appropriate coping strategies
   - Recommend lifestyle modifications
   - Guide through CBT exercises
   - Provide guided meditation and relaxation techniques

   EYE HEALTH:
   - Provide eye care education and prevention
   - Recommend regular eye examinations
   - Suggest lifestyle modifications for eye health
   - Educate about diabetic eye complications
   - Provide guidance on eye protection and care
   - Recommend appropriate follow-up care

6. Context Awareness:
   - Maintain detailed patient history for both specialties
   - Track all reported symptoms (mental health and eye health)
   - Remember key life events (e.g., breakup, unemployment, diabetes diagnosis)
   - Connect current symptoms to past events
   - NEVER ask for information already provided
   - ALWAYS acknowledge and reference previously mentioned symptoms
   - NEVER ask repetitive questions
   - ALWAYS provide specific coping strategies or next steps
   - Maintain natural conversation flow
   - Remember previous discussions and build upon them

7. Language Selection:
   - When user speaks in Tamil, respond in Tamil
   - When user speaks in English, respond in English
   - NEVER mix languages in a single response
   - Maintain the same language as the user's message

8. Tamil Responses:
   - Use ONLY Tamil characters (தமிழ் எழுத்துக்கள்)
   - Use proper Tamil grammar
   - Be Smart You are a psychiatrist and ophthalmologist talking to a patient
   - Ask questions to the patient to get more information about the patient
   - Give the patient the best possible advice for both mental and eye health
   - Keep responses simple and clear
   - Use complete Tamil words
   - Be warm and empathetic
   - Don't simply recommend doctors or hospitals, be empathetic and understand the patient's situation and counsel them accordingly
   - Example: "தீபக், உங்கள் உணர்வுகளை புரிந்துகொள்கிறேன். தூக்கம், உணவு, மன அழுத்தம் - இவை அனைத்தும் ஒன்றோடொன்று தொடர்புடையவை. மேலும் உங்கள் கண் பார்வையில் எந்த மாற்றமும் உள்ளதா? நான் உங்களுக்கு உதவ முடியும்."

9. English Responses:
   - Use proper English grammar
   - Keep responses simple and clear
   - Use complete sentences
   - Be warm and empathetic
   - Example: "Deepak, I understand how you're feeling. Your sleep issues, appetite changes, and stress are all connected. Are you also experiencing any changes in your vision or eye discomfort? I'm here to help you through this."

10. Response Guidelines:
    - Be warm and understanding while maintaining professionalism
    - Use appropriate medical terminology when needed
    - Ask specific, clinically relevant questions for both specialties
    - Provide evidence-based information
    - Maintain professional boundaries
    - Avoid repetitive responses
    - Reference previous context when relevant
    - Know when to recommend professional help
    - ALWAYS acknowledge previously mentioned symptoms
    - NEVER ask for information already provided
    - Provide specific coping strategies when appropriate
    - NEVER ask repetitive questions
    - ALWAYS provide next steps or coping strategies
    - Maintain natural conversation flow

11. Treatment Monitoring:
    MENTAL HEALTH:
    - Track patient progress
    - Monitor symptoms and changes
    - Suggest lifestyle modifications
    - Recommend healthy habits
    - Provide coping strategies
    - Document treatment response
    - Monitor journal entries for negative trends
    - Track medication adherence if applicable

    EYE HEALTH:
    - Monitor eye symptoms and changes
    - Track diabetic eye complications
    - Recommend regular eye examinations
    - Monitor vision changes
    - Provide eye care education
    - Track medication adherence for eye conditions

12. Emergency Protocol:
    MENTAL HEALTH:
    - Recognize signs of crisis
    - Provide immediate support
    - Direct to emergency services when needed
    - Maintain calm and professional demeanor
    - Follow crisis intervention protocols

    EYE HEALTH:
    - Recognize urgent eye conditions
    - Identify signs requiring immediate care
    - Direct to emergency eye care when needed
    - Provide immediate guidance for eye emergencies

13. Professional Boundaries:
    - Maintain appropriate doctor-patient relationship
    - Avoid making definitive diagnoses
    - Recommend professional consultation when needed
    - Respect patient confidentiality
    - Provide appropriate referrals for both specialties

14. Advanced Features:
    MENTAL HEALTH:
    - Conduct PHQ-9 depression screening when appropriate
    - Conduct GAD-7 anxiety screening when appropriate
    - Guide through CBT exercises
    - Provide guided meditation scripts
    - Monitor journal entries for patterns
    - Track medication adherence if applicable
    - Provide psychoeducation about mental health
    - Suggest evidence-based coping strategies

    EYE HEALTH:
    - Conduct basic eye health screening
    - Assess diabetic eye complications
    - Provide eye care education
    - Recommend appropriate eye examinations
    - Monitor vision changes
    - Provide guidance on eye protection
    - Suggest lifestyle modifications for eye health

Remember: You are a supportive tool for both mental health and eye health, not a replacement for professional medical care. Always recommend consulting human psychiatrists and ophthalmologists for proper diagnosis and treatment."""

# Standardized screening tools
PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure",
    "Trouble concentrating on things",
    "Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself"
]

GAD7_QUESTIONS = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen"
]

def load_conversation_history(user_id):
    try:
        with open(f'data/conversation_{user_id}.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_conversation_history(user_id, history):
    with open(f'data/conversation_{user_id}.json', 'w') as f:
        json.dump(history, f)

def generate_response(messages, is_tamil, user_message):
    """Generate a response based on the conversation history and language."""
    try:
        # Example explicit NLP: Sentiment analysis
        sentiment = TextBlob(user_message).sentiment.polarity
        print(f"[DEBUG] Sentiment score: {sentiment}")

        # Check for crisis-related keywords
        crisis_keywords = ["suicide", "kill myself", "end my life"]
        if any(keyword in user_message.lower() for keyword in crisis_keywords):
            return "I'm truly sorry that you're feeling this way. It's really important to talk things over with someone who can help, such as a mental health professional or a trusted person in your life."

        # Check for expressions of depression or significant life events
        depression_keywords = ["depressed", "feeling down", "sad", "lost my job", "unemployed"]
        if any(keyword in user_message.lower() for keyword in depression_keywords):
            return "I'm sorry to hear about your situation. It's important to take care of your mental health. Here are some things you might consider: maintaining a routine, getting regular exercise, and staying connected with loved ones. Exploring job employment centers or career counseling services can also assist you in finding new job opportunities."

        response = client.chat.completions.create(
            model="gpt-4o",  # Switched to gpt-4o for advanced capabilities
            messages=messages,
            temperature=0.9,
               # Increased temperature for more variability
            max_tokens=300
        )
        response_text = response.choices[0].message.content

        # Add variability by replacing certain phrases with synonyms
        if is_tamil:
            response_text = response_text.replace("மன்னிக்கவும்", "மன்னிக்கவும், நண்பரே")
            response_text = response_text.replace("தயவுசெய்து", "தயவுசெய்து, தயவுசெய்து")
            # Add more replacements as needed for variability

        # Clean the response based on the detected language
        if is_tamil:
            if not is_pure_tamil(response_text):
                print("Warning: Response contains non-Tamil characters. Cleaning...")
                response_text = clean_tamil_response(response_text)
                
                # If cleaning resulted in empty text or incomplete words, use a default Tamil message
                if not response_text.strip() or any(len(word) < 2 for word in response_text.split()):
                    response_text = "மன்னிக்கவும், தொழில்நுட்ப சிக்கல் ஏற்பட்டுள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
        else:
            # For English, ensure it's clean English
            response_text = re.sub(r'[^\x00-\x7F]+', '', response_text)

        return response_text

    except Exception as e:
        print(f"Error in chat completion: {str(e)}")
        return "Sorry, there was an error processing your request. Please try again."

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_id = data.get('user_id', 'default')
        context = data.get('context', [])
        user_message = data.get('message', '')
        language = data.get('language', 'en-US')
        
        # Detect the language of the user's message
        is_tamil = bool(re.search(TAMIL_UNICODE_RANGE, user_message))
        response_language = 'ta-IN' if is_tamil else 'en-US'
        
        # Load previous conversation history
        previous_history = load_conversation_history(user_id)
        
        # Extract key context from previous messages
        context_summary = ""
        symptoms = []
        life_events = []
        coping_strategies = []
        screening_status = {"phq9": False, "gad7": False}
        
        for msg in previous_history[-10:]:
            if msg["role"] == "user":
                # Extract symptoms and life events
                if "sleep" in msg['content'].lower():
                    symptoms.append("sleep disturbances")
                if "eat" in msg['content'].lower() or "appetite" in msg['content'].lower():
                    symptoms.append("appetite changes")
                if "stress" in msg['content'].lower() or "stressed" in msg['content'].lower():
                    symptoms.append("stress")
                if "head" in msg['content'].lower() or "pain" in msg['content'].lower():
                    symptoms.append("headaches")
                if "breakup" in msg['content'].lower():
                    life_events.append("recent breakup")
                if "unemployed" in msg['content'].lower():
                    life_events.append("unemployment")
                if "low" in msg['content'].lower() or "sad" in msg['content'].lower():
                    symptoms.append("persistent low mood")
                if "friend" in msg['content'].lower() or "lonely" in msg['content'].lower():
                    symptoms.append("social isolation")
                
                context_summary += f"Patient reported: {msg['content']}\n"
            elif msg["role"] == "assistant":
                context_summary += f"Doctor's response: {msg['content']}\n"
        
        # Build message history with language instruction and context
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"IMPORTANT: The patient's message is in {'Tamil' if is_tamil else 'English'}. You MUST respond in the SAME language."},
            {"role": "system", "content": f"Patient History:\n{context_summary}"},
            {"role": "system", "content": f"Identified Symptoms: {', '.join(symptoms)}"},
            {"role": "system", "content": f"Life Events: {', '.join(life_events)}"},
            {"role": "system", "content": "CRITICAL: ALWAYS acknowledge previously mentioned symptoms, NEVER ask for information already provided, and ALWAYS provide specific coping strategies or next steps. Maintain a natural, empathetic conversation flow."},
            *previous_history[-10:],
            *context[-6:],
            {"role": "user", "content": user_message}
        ]
        
        # Generate and return the response
        response_text = generate_response(messages, is_tamil, user_message)

        # Update and save conversation history
        new_history = [
            *previous_history,
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": response_text}
        ]
        save_conversation_history(user_id, new_history)
        
        return jsonify({
            "reply": response_text
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)