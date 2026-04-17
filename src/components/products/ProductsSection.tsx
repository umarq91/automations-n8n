import AddItemForm from './AddItemForm';
import ProductsList from './ProductsList';
import type { ActiveSection } from '../Sidebar';

interface ProductsSectionProps {
  subSection: 'list' | 'add-item';
  onNavigate: (section: ActiveSection) => void;
}

export default function ProductsSection({ subSection, onNavigate }: ProductsSectionProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {subSection === 'list'     && <ProductsList onNavigate={onNavigate} />}
      {subSection === 'add-item' && <AddItemForm onNavigate={onNavigate} />}
    </div>
  );
}
