import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

export function RecentActivity({ items }: { items: any[] }) {
  return (
    <div className="space-y-8">
      {items.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.user.image || ""} alt={item.user.name} />
            <AvatarFallback>{item.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {item.action} - {item.receivable?.identifier}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatDate(item.createdAt)}
          </div>
        </div>
      ))}
    </div>
  )
} 