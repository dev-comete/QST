from django.contrib import admin
from .models import Formation, Vague

@admin.register(Formation)
class FormationAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom_formation', 'organisation', 'createur')
    list_filter = ('organisation',)
    search_fields = ('nom_formation',)

@admin.register(Vague)
class VagueAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom_vague', 'formation', 'debut', 'fin')
    list_filter = ('formation',)
    search_fields = ('nom_vague',)