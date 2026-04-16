import AddItemForm from './AddItemForm';
import ProductsList from './ProductsList';

interface ProductsSectionProps {
  subSection: 'list' | 'add-item';
}

export default function ProductsSection({ subSection }: ProductsSectionProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {subSection === 'list'     && <ProductsList />}
      {subSection === 'add-item' && <AddItemForm />}
    </div>
  );
}
