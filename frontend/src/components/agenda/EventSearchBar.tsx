import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EventSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function EventSearchBar({ value, onChange, placeholder = "Rechercher une audience, une affaire..." }: EventSearchBarProps) {
    return (
        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
                placeholder={placeholder}
                className="pl-10 bg-background/50 border-border/50 focus-visible:ring-primary/20"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
