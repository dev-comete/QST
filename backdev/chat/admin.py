from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    # No Message inline: the general room can hold thousands of messages.
    list_display = ('id', 'type', 'title', 'direct_key', 'updated_at')
    list_filter = ('type',)
    raw_id_fields = ('participants',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'conversation', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'sender__username', 'sender__email')
    list_select_related = ('sender', 'conversation')
    raw_id_fields = ('conversation', 'sender')
    date_hierarchy = 'created_at'

    @admin.display(description='Content')
    def content_preview(self, obj):
        return obj.content[:60]
