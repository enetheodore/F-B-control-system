#signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Item

@receiver([post_save, post_delete], sender=Item)
def item_change_handler(sender, **kwargs):
    print("signal1")
    item = kwargs['instance']
    action = 'created' if kwargs['created'] else 'updated' if kwargs['update_fields'] else 'deleted'
    message = f'Item {action}: {item.name}'  # Customize the message as per your requirements

    channel_layer = get_channel_layer()

    # Send a WebSocket notification to connected clients
    async_to_sync(channel_layer.group_send)(
        'my_notification_group',
        {
            'type': 'item_changed',
            'message': message,
        }
    )