import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Send, X, Image, File } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: number;
  appointmentId: number;
  senderId: number;
  senderType: 'doctor' | 'patient';
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface ChatInterfaceProps {
  appointmentId: number;
  userId: number;
  userType: 'doctor' | 'patient';
  doctorId: number;
  patientId: number;
  doctorName: string;
  patientName: string;
  doctorAvatar?: string;
  patientAvatar?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  appointmentId,
  userId,
  userType,
  doctorId,
  patientId,
  doctorName,
  patientName,
  doctorAvatar,
  patientAvatar,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  
  // Connect to WebSocket
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    // Connection opened
    socketRef.current.addEventListener('open', () => {
      setIsConnected(true);
      
      // Authenticate
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'auth',
          userId,
          userType,
          doctorId: userType === 'doctor' ? doctorId : undefined
        }));
      }
    });
    
    // Listen for messages
    socketRef.current.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'auth_success') {
        // Join chat room
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({
            type: 'join_appointment_chat',
            appointmentId
          }));
        }
      }
      
      if (data.type === 'join_success') {
        toast({
          title: 'Connected to chat',
          description: `You are now chatting with ${userType === 'doctor' ? patientName : doctorName}`,
        });
      }
      
      if (data.type === 'chat_history') {
        // Format messages with sender info
        const formattedMessages = data.messages.map((msg: ChatMessage) => ({
          ...msg,
          senderName: msg.senderType === 'doctor' ? doctorName : patientName,
          senderAvatar: msg.senderType === 'doctor' ? doctorAvatar : patientAvatar,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(formattedMessages);
      }
      
      if (data.type === 'chat_message') {
        const newMessage: ChatMessage = {
          ...data.message,
          senderName: data.message.senderType === 'doctor' ? doctorName : patientName,
          senderAvatar: data.message.senderType === 'doctor' ? doctorAvatar : patientAvatar,
          timestamp: new Date(data.message.timestamp)
        };
        
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
      
      if (data.type === 'typing_status') {
        if (data.userId !== userId) {
          setOtherUserIsTyping(data.isTyping);
        }
      }
      
      if (data.type === 'error') {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    });
    
    // Handle connection close
    socketRef.current.addEventListener('close', () => {
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Connection to chat server lost. Trying to reconnect...',
        variant: 'destructive',
      });
    });
    
    // Handle connection error
    socketRef.current.addEventListener('error', () => {
      toast({
        title: 'Connection Error',
        description: 'Error connecting to chat server',
        variant: 'destructive',
      });
    });
    
    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [appointmentId, doctorAvatar, doctorId, doctorName, patientAvatar, patientName, toast, userId, userType]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send typing status
  useEffect(() => {
    const handleTyping = setTimeout(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'typing_status',
          isTyping: message.length > 0
        }));
      }
    }, 500);
    
    return () => clearTimeout(handleTyping);
  }, [message]);
  
  // Handle message input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };
  
  // Send message
  const sendMessage = async () => {
    if (!isConnected) {
      toast({
        title: 'Not Connected',
        description: 'Please wait until connection is established',
        variant: 'destructive',
      });
      return;
    }
    
    if ((!message.trim() && !attachment) || socketRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }
    
    let attachmentInfo = null;
    
    // If there's an attachment, upload it
    if (attachment) {
      try {
        const formData = new FormData();
        formData.append('file', attachment);
        formData.append('appointmentId', appointmentId.toString());
        
        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload attachment');
        }
        
        const data = await response.json();
        attachmentInfo = {
          url: data.url,
          type: attachment.type.startsWith('image/') ? 'image' : 'document'
        };
        
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload attachment',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Send message via WebSocket
    socketRef.current.send(JSON.stringify({
      type: 'chat_message',
      content: message.trim(),
      attachmentUrl: attachmentInfo?.url || null,
      attachmentType: attachmentInfo?.type || null
    }));
    
    // Clear input and attachment
    setMessage('');
    setAttachment(null);
    setAttachmentPreview(null);
    setIsTyping(false);
    setShowAttachmentOptions(false);
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setAttachment(file);
    
    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };
  
  // Remove attachment
  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle key press (Ctrl/Cmd + Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Card className="flex flex-col h-[600px] shadow-lg">
      <CardHeader className="border-b bg-muted/30 py-3">
        <CardTitle className="text-lg flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage 
              src={userType === 'doctor' ? patientAvatar : doctorAvatar} 
              alt={userType === 'doctor' ? patientName : doctorName} 
            />
            <AvatarFallback>
              {userType === 'doctor' 
                ? patientName.substring(0, 2).toUpperCase() 
                : doctorName.substring(0, 2).toUpperCase()
              }
            </AvatarFallback>
          </Avatar>
          <span>
            {userType === 'doctor' ? patientName : doctorName}
            {!isConnected && <span className="text-sm text-muted-foreground ml-2">(Connecting...)</span>}
          </span>
          {otherUserIsTyping && (
            <span className="text-sm text-muted-foreground ml-2 italic">typing...</span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex max-w-[80%] flex-col",
                  msg.senderId === userId ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center mb-1">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                    <AvatarFallback>
                      {msg.senderName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{msg.senderName}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                <div 
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-full",
                    msg.senderId === userId 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}
                >
                  {msg.content}
                </div>
                
                {msg.attachmentUrl && msg.attachmentType === 'image' && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img 
                      src={msg.attachmentUrl} 
                      alt="Attachment" 
                      className="max-w-[300px] max-h-[200px] object-contain"
                    />
                  </div>
                )}
                
                {msg.attachmentUrl && msg.attachmentType === 'document' && (
                  <a 
                    href={msg.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-2 flex items-center p-2 border rounded-lg bg-muted hover:bg-muted/80"
                  >
                    <File className="h-5 w-5 mr-2" />
                    <span className="text-sm">View Document</span>
                  </a>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {/* Attachment Preview */}
      {attachmentPreview && (
        <div className="px-4 py-2 border-t">
          <div className="relative inline-block">
            <img 
              src={attachmentPreview} 
              alt="Attachment Preview" 
              className="h-20 rounded-md object-cover"
            />
            <button 
              onClick={removeAttachment}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      )}
      
      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <Textarea
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none min-h-[80px]"
              disabled={!isConnected}
            />
            
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                      disabled={!isConnected}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add attachment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {showAttachmentOptions && (
                <DropdownMenu open={showAttachmentOptions} onOpenChange={setShowAttachmentOptions}>
                  <DropdownMenuTrigger asChild>
                    <div></div> {/* Empty div as we're controlling open state manually */}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachmentOptions(false);
                    }}>
                      <Image className="mr-2 h-4 w-4" />
                      <span>Image</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachmentOptions(false);
                    }}>
                      <File className="mr-2 h-4 w-4" />
                      <span>Document</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </div>
          </div>
          
          <Button 
            onClick={sendMessage} 
            disabled={(!message.trim() && !attachment) || !isConnected}
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Press Ctrl+Enter to send
          </span>
          {!isConnected && (
            <span className="text-xs text-destructive flex items-center">
              Connecting...
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;