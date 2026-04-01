import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Phone, Mail, MapPin, Building, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface SellerRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SellerRegistrationModal = ({ open, onOpenChange }: SellerRegistrationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.storeName.trim()) newErrors.storeName = "Store name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to register as a seller.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Register via backend API
      await api.post('/sellers/register', {
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      });

      toast({
        title: "Application submitted!",
        description: "Your seller application is under review. We'll notify you once approved.",
      });

      onOpenChange(false);
      navigate('/seller');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Become a Seller
          </DialogTitle>
          <DialogDescription>
            Start selling your products on our marketplace. Fill in your store details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="storeName">
              <Store className="h-4 w-4 inline mr-1" />
              Store Name *
            </Label>
            <Input
              id="storeName"
              placeholder="Your store name"
              value={formData.storeName}
              onChange={(e) => handleInputChange("storeName", e.target.value)}
              className={errors.storeName ? "border-destructive" : ""}
            />
            {errors.storeName && <p className="text-xs text-destructive">{errors.storeName}</p>}
          </div>

          {/* Store Description */}
          <div className="space-y-2">
            <Label htmlFor="storeDescription">
              <FileText className="h-4 w-4 inline mr-1" />
              Store Description
            </Label>
            <Textarea
              id="storeDescription"
              placeholder="Tell customers about your store..."
              value={formData.storeDescription}
              onChange={(e) => handleInputChange("storeDescription", e.target.value)}
              rows={3}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+252..."
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="store@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="h-4 w-4 inline mr-1" />
              Business Address *
            </Label>
            <Input
              id="address"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                <Building className="h-4 w-4 inline mr-1" />
                City *
              </Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className={errors.country ? "border-destructive" : ""}
              />
              {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Apply to Sell"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SellerRegistrationModal;
