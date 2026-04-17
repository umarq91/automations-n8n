import AddItemForm from './AddItemForm';
import EditItemForm from './EditItemForm';
import ProductsList from './ProductsList';
import type { ActiveSection } from '../Sidebar';

interface ProductsSectionProps {
  subSection: 'list' | 'add-item' | 'edit-item';
  editingProductId?: string;
  onNavigate: (section: ActiveSection, productId?: string) => void;
}

export default function ProductsSection({ subSection, editingProductId, onNavigate }: ProductsSectionProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {subSection === 'list'      && <ProductsList onNavigate={onNavigate} />}
      {subSection === 'add-item'  && <AddItemForm onNavigate={onNavigate} />}
      {subSection === 'edit-item' && editingProductId && (
        <EditItemForm productId={editingProductId} onNavigate={onNavigate} />
      )}
    </div>
  );
}
