import { MapPin, Plus, Edit, Trash2, Home, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockAddresses = [
  {
    id: 1,
    type: 'Home',
    name: 'John Doe',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
    phone: '+1 (555) 123-4567',
    isDefault: true,
  },
  {
    id: 2,
    type: 'Office',
    name: 'John Doe',
    street: '456 Business Ave',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    country: 'USA',
    phone: '+1 (555) 987-6543',
    isDefault: false,
  },
];

const AddressesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Saved Addresses</h2>
        <Button variant="default" className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAddresses.map((address) => (
          <div
            key={address.id}
            className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  address.type === 'Home' ? 'bg-primary/10' : 'bg-accent/10'
                }`}>
                  {address.type === 'Home' ? (
                    <Home className="w-6 h-6 text-primary" />
                  ) : (
                    <Briefcase className="w-6 h-6 text-accent" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{address.type}</h3>
                  {address.isDefault && (
                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full border border-success/20">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{address.name}</p>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p>{address.country}</p>
                  <p className="mt-2 text-foreground">{address.phone}</p>
                </div>
              </div>
            </div>

            {!address.isDefault && (
              <Button variant="outline" size="sm" className="w-full mt-4">
                Set as Default
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
