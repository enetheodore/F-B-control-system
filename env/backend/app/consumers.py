# app/consumers.py
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

# class TextRoomConsumer(WebsocketConsumer):
#     def connect(self):

#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = 'chat_%s' % self.room_name
#         # Join room group
#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name,
#             self.channel_name
#         )
#         self.accept()
#     def disconnect(self, close_code):
#         # Leave room group
#         async_to_sync(self.channel_layer.group_discard)(
#             self.room_group_name,
#             self.channel_name
#         )

#     def receive(self, text_data):
#         # Receive message from WebSocket
#         text_data_json = json.loads(text_data)
#         text = text_data_json['text']
#         sender = text_data_json['sender']
#         # Send message to room group
#         async_to_sync(self.channel_layer.group_send)(
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': text,
#                 'sender': sender
#             }
#         )

#     def chat_message(self, event):
#         # Receive message from room group
#         text = event['message']
#         sender = event['sender']
#         # Send message to WebSocket
#         self.send(text_data=json.dumps({
#             'text': text,
#             'sender': sender
#         }))

from channels.generic.websocket import AsyncWebsocketConsumer

from channels.generic.websocket import WebsocketConsumer
import json

class NotificationConsumer(WebsocketConsumer):
    def connect(self):
        
        # Connect the consumer to the group
        self.group_name = 'NotificationGroup'
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        # Disconnect the consumer from the group
        async_to_sync(self.channel_layer.group_discard)(self.group_name, self.channel_name)

    def receive(self, text_data):
        # Receive WebSocket message from the client (optional)
        pass

    def item_changed(self, event):
        
        # Handle item changed event
        message = event['message']
        # Add a logging statement to check if the group receives the message
        
        # Send the item change notification to the connected clients in the group
        self.send(text_data=json.dumps(message))

from channels.generic.websocket import AsyncWebsocketConsumer
from hmsrest.models import ItemTransfer
from hmsrest.serializers import ItemTransferSerializer


from channels.generic.websocket import AsyncWebsocketConsumer
from hmsrest.models import ItemTransfer,CustomUser
from hmsrest.serializers import ItemTransferSerializer
from rest_framework.exceptions import ValidationError
from asgiref.sync import sync_to_async


from channels.generic.websocket import WebsocketConsumer
import json

from channels.generic.websocket import WebsocketConsumer
import json
from channels.layers import get_channel_layer


class ItemTransferConsumer(WebsocketConsumer):
    def connect(self):
        self.group_name = 'ItemTransferGroup'
        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        self.channel_layer.group_discard(self.group_name, self.channel_name)

    def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type')
       

        if event_type == 'create_item_transfer':
            self.create_item_transfer(data.get('item_transfer_data'))
        elif event_type == 'approve_request':
            request_ids = data.get('request_ids')
            if request_ids is not None:
                self.approve_request(request_ids)
            else:
                print("Missing 'requestIds' in the event data")

        elif event_type == 'reject_request':
            request_id = data.get('request_id')
            index = data.get('index')
            if request_id is not None and index is not None and isinstance(index, int) and index >= 0:
                self.reject_request(request_id, index)

       
        else:
            print("nothing",event_type)

    def create_item_transfer(self, event_data):
        item_transfer_data = event_data
       
        item_transfer_serializer = ItemTransferSerializer(data=item_transfer_data)

        try:
            item_transfer_serializer.is_valid(raise_exception=True)
            item_transfer = item_transfer_serializer.save()

            store_keeper = CustomUser.objects.filter(role='storeKeeper').first()
            if store_keeper:
                item_transfer.grant_user = store_keeper
            item_transfer.save()
           
            self.send_item_transfer(item_transfer)
        except ValidationError as e:
            pass

    def send_item_transfer(self, item_transfer):
        item_transfer_serializer = ItemTransferSerializer(item_transfer)
        item_transfer_data = item_transfer_serializer.data
       

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            self.group_name,
            {
                'type': 'item_transfer_broadcast',
                'item_transfer_data': item_transfer_data,
            }
        )

    def item_transfer_broadcast(self, event):
       
        item_transfer_data = event['item_transfer_data']
       
        self.send(json.dumps({
            'type': 'item_transfer',
            'item_transfer_data': item_transfer_data,
        }))

    def item_transfer(self, event):
        item_transfer_data = event['item_transfer_data']
        self.send(item_transfer_data)

    def approve_request(self, request_ids):
        if request_ids is None:
            print("Empty 'request_ids' in the approve_request method")
            return
        
        for request_id in request_ids:
            try:
                item_transfer = ItemTransfer.objects.get(id=request_id)
                for item in item_transfer.items:
                    if item['status'] == 'pending':
                        item['status'] = 'approved'
                item_transfer.save()

            # Send the updated item transfer to the connected clients in the group
                self.send_item_transfer(item_transfer)
            except ItemTransfer.DoesNotExist:
                pass

    def reject_request(self, request_id, index):
        item_transfer = ItemTransfer.objects.get(id=request_id)
        items = item_transfer.items  # Access the list of items

        if 0 <= index < len(items) and items[index].get('status') == 'pending':
            # Reject the item at the specified index
            items[index]['status'] = 'rejected'

            # Save the changes to the item_transfer object if needed
            item_transfer.save()

            # Send a WebSocket message to notify other clients about the rejection
            self.send_item_transfer(item_transfer)
        else:
            # Handle appropriate error condition (e.g., item not found or status is not pending)
            pass