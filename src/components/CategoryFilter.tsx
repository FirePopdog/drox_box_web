import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectCategory(null)}
      >
        全部
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            selectedCategory === category.id && 'text-white'
          )}
          style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
        >
          <span
            className="mr-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </Button>
      ))}
    </div>
  );
}
