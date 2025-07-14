export interface FilterProps {
  id: string;
  slug: string;
  name: string;
  color: string;
}

export interface FilterNavProps {
  categories: FilterProps[];
}

export interface SortProps {
  id: string;
  slug: string;
  name: string;
}