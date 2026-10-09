from django.db import models
from django.conf import settings

class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ('direct', 'Direct (1-on-1)'),
        ('general', 'General Formateurs'),
    )
    type = models.CharField(max_length=20, choices=CONVERSATION_TYPES, default='direct')
    title = models.CharField(max_length=255, blank=True, null=True)
    
    # Link to the user model defined in your project
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.title:
            return self.title
        return f"{self.get_type_display()} - {self.id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    
    # Optional: Links to specific QST entities if formateurs share them in chat
    related_question_id = models.IntegerField(null=True, blank=True)
    related_quiz_id = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at'] # Oldest messages first, typical for chat UI

    def __str__(self):
        # If the message hasn't been saved to the database yet, 
        # it doesn't have an ID or a timestamp.
        if not self.id:
            return "New Message"
            
        return f"[{self.created_at.strftime('%H:%M')}] {self.sender}: {self.content[:30]}"