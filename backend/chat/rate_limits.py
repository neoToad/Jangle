from django.conf import settings
from django.core.cache import cache


def chat_message_rate_limit():
    return int(getattr(settings, 'CHAT_MESSAGE_RATE_LIMIT', 20))


def consume_chat_message_token(user_id):
    if not user_id:
        return False
    key = f'chat-rate:{user_id}'
    limit = chat_message_rate_limit()
    current = cache.get(key)
    if current is None:
        cache.set(key, 1, timeout=60)
        return True
    if int(current) >= limit:
        return False
    try:
        cache.incr(key)
    except ValueError:
        cache.set(key, int(current) + 1, timeout=60)
    return True
