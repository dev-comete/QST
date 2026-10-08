from django.contrib import admin
from .models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'title', 'created_at')
    list_filter = ('type',)
    inlines = [MessageInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'conversation', 'content', 'created_at')
    list_filter = ('created_at', 'sender')
    search_fields = ('content',)