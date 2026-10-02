import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, User, Order, EmailLog } from './types/store';
import { api } from './lib/api';
import { Header } from './components/Header';
import { BagDrawer } from './components/BagDrawer';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { PolicyModal } from './components/PolicyModal';
import { Footer } from './components/Footer';
import { SupabaseDiagnostic } from './components/SupabaseDiagnostic';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { AccountView } from './views/AccountView';
import { CollectionView, AboutView, LookbookView, JournalView } from './views/EditorialViews';

function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    view: params.get('view') || 'home',
    productSlug: params.get('product') || '',
    category: params.get('category') || 'All',
    q: params.get('q') || '',
    sort: params.get('sort') || 'featured',
  };
}

export default function App() {
  const initialUrl = parseUrlState();

  const [currentView, setCurrentView] = useState<string>(initialUrl.view);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialUrl.productSlug);
  const [shopCategory, setShopCategory] = useState<string>(initialUrl.category);
  const [shopQuery, setShopQuery] = useState<string>(initialUrl.q);
  const [shopSort, setShopSort] = useState<string>(initialUrl.sort);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [bagOpen, setBagOpen] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'privacy' | 'care' | null>(null);

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedEmailLog, setConfirmedEmailLog] = useState<EmailLog | null>(null);

  const syncUrl = useCallback(
    (
      nextView: string,
      opts?: { product?: string; category?: string; q?: string; sort?: string }
    ) => {
      const params = new URLSearchParams();
      if (nextView && nextView !== 'home') {
        params.set('view', nextView);
      }
      if (nextView === 'product' && opts?.product) {
        params.set('product', opts.product);
      }
      if (nextView === 'shop') {
        if (opts?.category && opts.category !== 'All') {
          params.set('category', opts.category);
        }
        if (opts?.q && opts.q.trim()) {
          params.set('q', opts.q.trim());
        }
        if (opts?.sort && opts.sort !== 'featured') {
          params.set('sort', opts.sort);
        }
      }
      const qs = params.toString();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
      window.history.pushState({}, '', newUrl);
    },
    []
  );

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseUrlState();
      setCurrentView(parsed.view);
      setSelectedSlug(parsed.productSlug);
      setShopCategory(parsed.category);
      setShopQuery(parsed.q);
      setShopSort(parsed.sort);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const loadInitialData = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const [prodList, cartItems, currentUser] = await Promise.all([
        api.fetchProducts(),
        api.fetchCart().catch(() => []),
        api.getCurrentUser().catch(() => null),
      ]);
      setProducts(prodList);
      setCart(cartItems);
      setUser(currentUser);
    } catch (err: unknown) {
      setProductsError(
        err instanceof Error ? err.message : 'Unable to connect to studio database.'
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleNavigate = (view: string, params?: Record<string, string>) => {
    const nextCategory = params?.category || (view === 'shop' ? 'All' : shopCategory);
    const nextQuery = params?.q ?? '';
    const nextSort = params?.sort || 'featured';

    if (view === 'shop') {
      setShopCategory(nextCategory);
      setShopQuery(nextQuery);
      setShopSort(nextSort);
    }

    setCurrentView(view);
    syncUrl(view, {
      category: nextCategory,
      q: nextQuery,
      sort: nextSort,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentView('product');
    syncUrl('product', { product: slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setShopCategory('All');
    setShopQuery(query);
    setShopSort('featured');
    setCurrentView('shop');
    syncUrl('shop', { category: 'All', q: query, sort: 'featured' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    const res = await api.addToCart(productId, variantId, quantity);
    setCart(res.cart);
    setBagOpen(true);
  };

  const handleUpdateCartQuantity = async (
    productId: string,
    variantId: string,
    newQty: number
  ) => {
    const res = await api.updateCartQuantity(productId, variantId, newQty);
    setCart(res.cart);
  };

  const handleRemoveCartItem = async (cartItemId: string) => {
    const res = await api.removeCartItem(cartItemId);
    setCart(res.cart);
  };

  const handleAuthSuccess = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    const mergedCart = await api.fetchCart().catch(() => cart);
    setCart(mergedCart);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  const handleOrderCreated = async (order: Order, emailLog: EmailLog) => {
    setConfirmedOrder(order);
    setConfirmedEmailLog(emailLog);
    setCart([]);
    api
      .fetchProducts()
      .then((fresh) => setProducts(fresh))
      .catch(() => {});
    setCurrentView('confirmation');
    syncUrl('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#161514]">
      <Header
        currentView={currentView}
        cartCount={totalBagCount}
        user={user}
        onNavigate={handleNavigate}
        onOpenBag={() => setBagOpen(true)}
        onSearchSubmit={handleSearchSubmit}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            loading={productsLoading}
            error={productsError}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
          />
        )}

        {currentView === 'shop' && (
          <ShopView
            initialCategory={shopCategory}
            initialQuery={shopQuery}
            initialSort={shopSort}
            onUpdateUrlParams={(params) => {
              setShopCategory(params.category);
              setShopQuery(params.q);
              setShopSort(params.sort);
              syncUrl('shop', params);
            }}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product' && selectedSlug && (
          <ProductDetailView
            slug={selectedSlug}
            onBack={() => handleNavigate('shop')}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'collection' && (
          <CollectionView
            products={products}
            onSelectProduct={handleSelectProduct}
            onShopAll={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'lookbook' && (
          <LookbookView
            products={products}
            onSelectProduct={handleSelectProduct}
            onShopAll={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'journal' && (
          <JournalView />
        )}

        {currentView === 'about' && (
          <AboutView onShopAll={() => handleNavigate('shop')} />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cart={cart}
            user={user}
            onBackToShop={() => handleNavigate('shop')}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {currentView === 'confirmation' && confirmedOrder && (
          <OrderConfirmationView
            order={confirmedOrder}
            emailLog={confirmedEmailLog}
            onContinueShopping={() => handleNavigate('shop')}
            onViewAccountOrders={() => handleNavigate('account')}
          />
        )}

        {currentView === 'account' && (
          <AccountView
            user={user}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
            onUserUpdated={(u) => setUser(u)}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenPolicy={(p) => setActivePolicy(p)}
        onOpenDiagnostic={() => setDiagnosticOpen(true)}
      />

      <BagDrawer
        isOpen={bagOpen}
        items={cart}
        onClose={() => setBagOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setCurrentView('checkout');
          syncUrl('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectProduct={handleSelectProduct}
      />

      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <PolicyModal
        policy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      <SupabaseDiagnostic
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
      />
    </div>
  );
}
