import { Skeleton } from '@/components/ui/skeleton';
import { useMessages, useMarkMessageRead } from '@/hooks/useAdminData';
import { format } from 'date-fns';

const MessagesPage = () => {
  const { data: messages, isLoading } = useMessages();
  const markRead = useMarkMessageRead();

  const handleMessageClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markRead.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-4 md:p-6 border-b border-border">
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = messages?.filter(m => !m.is_read).length || 0;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Messages</h2>
        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>
      
      {!messages || messages.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>No messages found</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {messages.map((message) => (
            <div 
              key={message.id} 
              onClick={() => handleMessageClick(message.id, message.is_read)}
              className={`p-4 md:p-6 hover:bg-muted/50 transition-colors cursor-pointer ${!message.is_read ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-foreground text-sm ${!message.is_read ? 'font-bold' : ''}`}>
                      {message.subject || 'No subject'}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className={`text-sm ${!message.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'} line-clamp-2`}>
                    {message.message}
                  </p>
                </div>
                {!message.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
