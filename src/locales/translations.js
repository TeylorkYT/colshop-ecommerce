export const translations = {
  es: {
    header: {
      home: 'Inicio',
      catalog: 'Catálogo',
      orders: 'Mis Pedidos',
      inventory: 'Inventario',
      tickets: 'Tickets',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      cart: 'Carrito',
      search: 'Buscar...',
      welcome: 'Bienvenido',
      hello: 'Hola'
    },
    calculator: {
      title: 'Calculadora de Robux',
      subtitle: 'Cotiza y compra tus Robux al instante',
      amount: 'Cantidad de Robux',
      price: 'Precio Estimado',
      buy: 'Comprar Ahora',
      productDescription: 'Descripción del Producto',
      quickSelect: 'Selección Rápida',
      conversionRate: '1 R$ ≈ {rate}',
      instantDelivery: '(Entrega Inmediata)',
      currencyName: 'Robux'
    },
    home: {
      heroTitlePrefix: 'Sube de Nivel tu',
      heroTitleSuffix: 'Experiencia Gaming',
      heroSubtitle: 'Acceso instantáneo a contenido premium, moneda virtual y beneficios exclusivos',
      browseCatalog: 'Ver Catálogo',
      getStarted: 'Comenzar',
      featuredTitle: 'Productos Destacados',
      featuredSubtitle: 'Mira nuestros artículos más vendidos',
      viewAll: 'Ver Todos los Productos',
      features: {
        securePayment: 'Pago Seguro',
        securePaymentDesc: 'Integración con Mercado Pago para transacciones seguras',
        fastDelivery: 'Entrega Rápida',
        fastDeliveryDesc: 'Entrega digital instantánea a tu cuenta',
        support: 'Soporte en Discord',
        supportDesc: '¡Únete a nuestra comunidad para soporte rápido!',
        bestPrices: 'Mejores Precios',
        bestPricesDesc: 'Precios competitivos en todos los productos'
      },
      robuxCard: {
        badge: 'Calculadora',
        stock: 'Stock Disponible',
        pricePerUnit: '{price} / 1R$'
      }
    },
    catalog: {
      title: 'Catálogo de Productos',
      subtitle: 'Explora nuestra colección completa de productos gaming',
      searchPlaceholder: 'Buscar productos...',
      priceLowToHigh: 'Precio: Bajo a Alto',
      priceHighToLow: 'Precio: Alto a Bajo',
      noProducts: 'No se encontraron productos',
      filters: 'Filtros',
      categories: {
        all: 'Todos',
        streaming: 'Streaming',
        robux: 'Robux',
        gamepasses: 'Pases de Juego',
        minecraft: 'Minecraft',
        fortnite: 'Fortnite',
        'clash-royale': 'Clash Royale',
        'ingame-items': 'Items de Juegos'
      },
      categoriesTitle: 'Categorías',
      allProducts: 'Todos los Productos'
    },
    product: {
      backToCatalog: 'Volver al Catálogo',
      notFound: 'Producto no encontrado',
      addToCart: 'Añadir',
      added: 'Añadido',
      quantity: 'Cantidad',
      relatedProducts: 'Productos Relacionados',
      instantDelivery: 'Entrega Instantánea',
      stock: {
        out: 'Agotado',
        low: '¡Solo quedan {stock}!',
        in: 'En Stock'
      },
      addedToCart: 'Añadido al Carrito',
      addedToCartDesc: '{quantity}x {name} añadido a tu carrito',
      loginRequired: 'Inicio de Sesión Requerido',
      loginRequiredDesc: 'Por favor inicia sesión para añadir items',
      insufficientStock: 'Stock Insuficiente',
      insufficientStockDesc: 'Solo hay {stock} artículos disponibles'
    },
    cart: {
      title: 'Carrito de Compras',
      emptyTitle: 'Tu carrito está vacío',
      emptySubtitle: '¡Añade algunos productos para comenzar!',
      browseProducts: 'Explorar Productos',
      itemsCount: '{count} artículos en tu carrito',
      summary: 'Resumen del Pedido',
      subtotal: 'Subtotal',
      tax: 'Impuestos',
      total: 'Total',
      proceedToCheckout: 'Proceder al Pago',
      continueShopping: 'Continuar Comprando',
      each: 'c/u'
    },
    checkout: {
      title: 'Finalizar Compra',
      subtitle: 'Completa tu pedido',
      shippingInfo: 'Información de Envío',
      paymentInfo: 'Información de Pago',
      placeOrder: 'Realizar Pedido',
      successTitle: '¡Pedido Exitoso!',
      successDesc: 'El pedido #{id} se ha realizado con éxito',
      failedTitle: 'Pedido Fallido',
      continueToPayment: 'Continuar al Pago',
      form: {
        fullName: 'Nombre Completo',
        address: 'Dirección',
        city: 'Ciudad',
        postalCode: 'Código Postal',
        country: 'País',
        placeholder: {
          fullName: 'Juan Pérez',
          address: 'Av. Principal 123',
          city: 'Bogotá',
          postalCode: '110111',
          country: 'Colombia'
        }
      },
      paymentDetails: 'Detalles de Pago',
      testMode: 'MODO PRUEBA',
      securePaymentMercadoPago: 'Pago Seguro vía Mercado Pago',
      transactionFee: 'Costo de Procesamiento',
      orderValue: 'Valor del Pedido',
      totalToPay: 'Total a Pagar',
      redirectMessage: 'Serás redirigido a la pasarela de pagos segura de Mercado Pago para completar tu compra.',
      processing: 'Procesando...',
      payWith: 'Pagar {amount} con Mercado Pago',
      backToShipping: 'Volver al Envío',
      connectionErrorTitle: 'Error de conexión',
      connectionErrorDesc: 'La pasarela de pagos no está disponible. Por favor recarga la página o revisa tu conexión.'
    },
    dashboard: {
      title: 'Mis Pedidos',
      subtitle: 'Ver y gestionar historial de pedidos',
      noOrders: 'Aún no hay pedidos',
      noOrdersDesc: 'Empieza a comprar para ver tus pedidos aquí',
      memberSince: 'Miembro desde {date}',
      orderId: 'Pedido #{id}...',
      orderNotPaid: 'Pago no realizado',
      items: {
        one: '{count} artículo',
        other: '{count} artículos'
      },
      errorFetchingOrders: 'Error al cargar los pedidos. Intenta de nuevo.',
      view: 'Ver',
      hide: 'Ocultar',
      orderItems: 'Artículos del Pedido',
      shippingInfo: 'Información de Envío',
      status: {
        completed: 'Completado',
        processing: 'En Proceso (Pagado)',
        pending: 'Pendiente',
        cancelled: 'Cancelado',
        unknown: 'Desconocido'
      }
    },
    auth: {
      loginTitle: 'Bienvenido de Nuevo',
      loginSubtitle: 'Inicia sesión en tu cuenta',
      signupTitle: 'Crear Cuenta',
      signupSubtitle: 'Únete a GameStore hoy',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      loginButton: 'Iniciar Sesión',
      signupButton: 'Registrarse',
      loggingIn: 'Iniciando sesión...',
      creatingAccount: 'Creando cuenta...',
      noAccount: '¿No tienes una cuenta?',
      hasAccount: '¿Ya tienes una cuenta?',
      passwordsNoMatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
      successLogin: '¡Bienvenido de nuevo!',
      successSignup: '¡Cuenta creada!',
      loginError: 'Error al iniciar sesión',
      signupError: 'Error al registrarse'
    },
    inventory: {
      title: 'Gestor de Inventario',
      subtitle: 'Gestionar catálogo de productos y stock',
      addProduct: 'Añadir Producto',
      editProduct: 'Editar Producto',
      updateProduct: 'Actualizar Producto',
      deleteConfirm: '¿Estás seguro de que quieres eliminar este producto?',
      lowStockAlert: 'Alerta de Stock Bajo',
      lowStockDesc: '{count} producto(s) tienen niveles bajos de stock',
      form: {
        name: 'Nombre del Producto',
        category: 'Categoría',
        price: 'Precio (COP)',
        stock: 'Stock',
        type: 'Tipo / Juego (ID)',
        imageUrl: 'URL de Imagen',
        description: 'Descripción',
        selectCategory: 'Seleccionar categoría'
      },
      table: {
        product: 'Producto',
        category: 'Categoría',
        price: 'Precio (COP)',
        stock: 'Stock',
        actions: 'Acciones'
      },
      errorAdd: 'Error al añadir el producto.',
      errorUpdate: 'Error al actualizar el producto.',
      errorDelete: 'Error al eliminar el producto.',
      successUpdate: 'Producto Actualizado',
      successAdd: 'Producto Añadido',
      successDelete: 'Producto Eliminado'
    },
    ticket: {
      title: 'Ticket de Compra #{id}',
      status: { open: 'Abierto', closed: 'Cerrado' },
      subtitle: 'Aquí recibirás tu producto y soporte.',
      closeButton: 'Cerrar Ticket',
      button: 'Ticket',
      closeConfirm: '¿Estás seguro de cerrar este ticket?',
      welcome: 'Bienvenido al soporte. Un agente te atenderá pronto para entregar tu producto.',
      you: 'Tú',
      support: 'Soporte',
      placeholder: 'Escribe un mensaje...',
      closedMessage: 'Este ticket ha sido cerrado y completado.'
    },
    products: {
      '1': {
        name: 'Netflix Premium 1 Mes',
        description: 'Suscripción Netflix Premium por 1 mes. Incluye streaming en 4K y 4 pantallas simultáneas.'
      },
      'robux-currency': {
        name: 'Robux Coin',
        description: 'Cotiza y compra tus Robux al instante'
      },
      '3': {
        name: 'Rango VIP Minecraft',
        description: 'Rango VIP con beneficios exclusivos y comandos en nuestro servidor de Minecraft.'
      },
      '4': {
        name: '2800 V-Bucks',
        description: 'V-Bucks de Fortnite para comprar skins, gestos y el Pase de Batalla.'
      },
      '5': {
        name: 'Spotify Premium 3 Meses',
        description: 'Spotify Premium por 3 meses. Música sin anuncios con descargas offline.'
      },
      '7': {
        name: 'Pass Royale Clash Royale',
        description: 'Pase de Temporada con recompensas exclusivas, reacciones y aspectos de torre.'
      },
      '8': {
        name: 'Rango MVP++ Minecraft',
        description: 'Rango definitivo MVP++ con todos los beneficios, comandos y cosméticos exclusivos.'
      },
      // EJEMPLO: Añade aquí tus nuevos productos. Asegúrate de que el ID ('9') coincida con el de la base de datos.
      '9': {
        name: 'Discord Nitro 1 Mes',
        description: 'Disfruta de un mes de Discord Nitro con emojis personalizados, subidas de mayor calidad y más.'
      }
    }
  },
  en: {
    header: {
      home: 'Home',
      catalog: 'Catalog',
      orders: 'My Orders',
      inventory: 'Inventory',
      tickets: 'Tickets',
      login: 'Login',
      logout: 'Logout',
      cart: 'Cart',
      search: 'Search...',
      welcome: 'Welcome',
      hello: 'Hello'
    },
    calculator: {
      title: 'Robux Calculator',
      subtitle: 'Quote and buy your Robux instantly',
      amount: 'Robux Amount',
      price: 'Estimated Price',
      buy: 'Buy Now',
      productDescription: 'Product Description',
      quickSelect: 'Quick Select',
      conversionRate: '1 R$ ≈ {rate}',
      instantDelivery: '(Instant Delivery)',
      currencyName: 'Robux'
    },
    home: {
      heroTitlePrefix: 'Level Up Your',
      heroTitleSuffix: 'Gaming Experience',
      heroSubtitle: 'Get instant access to premium gaming content, virtual currency, and exclusive perks',
      browseCatalog: 'Browse Catalog',
      getStarted: 'Get Started',
      featuredTitle: 'Featured Products',
      featuredSubtitle: 'Check out our best-selling items',
      viewAll: 'View All Products',
      features: {
        securePayment: 'Secure Payment',
        securePaymentDesc: 'Mercado Pago integration for safe transactions',
        fastDelivery: 'Fast Delivery',
        fastDeliveryDesc: 'Instant digital delivery to your account',
        support: 'Discord Support',
        supportDesc: 'Join our community for fast support!',
        bestPrices: 'Best Prices',
        bestPricesDesc: 'Competitive pricing on all products'
      },
      robuxCard: {
        badge: 'Calculator',
        stock: 'Stock Available',
        pricePerUnit: '{price} / 1R$'
      }
    },
    catalog: {
      title: 'Product Catalog',
      subtitle: 'Browse our complete collection of gaming products',
      searchPlaceholder: 'Search products...',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      noProducts: 'No products found',
      filters: 'Filters',
      categories: {
        all: 'All',
        streaming: 'Streaming',
        robux: 'Robux',
        gamepasses: 'Gamepasses',
        minecraft: 'Minecraft',
        fortnite: 'Fortnite',
        'clash-royale': 'Clash Royale',
        'ingame-items': 'In-Game Items'
      },
      categoriesTitle: 'Categories',
      allProducts: 'All Products'
    },
    product: {
      backToCatalog: 'Back to Catalog',
      notFound: 'Product not found',
      addToCart: 'Add',
      added: 'Added',
      quantity: 'Quantity',
      relatedProducts: 'Related Products',
      instantDelivery: 'Instant Delivery',
      stock: {
        out: 'Out of Stock',
        low: 'Only {stock} left!',
        in: 'In Stock'
      },
      addedToCart: 'Added to Cart',
      addedToCartDesc: '{quantity}x {name} added to your cart',
      loginRequired: 'Login Required',
      loginRequiredDesc: 'Please login to add items to cart',
      insufficientStock: 'Insufficient Stock',
      insufficientStockDesc: 'Only {stock} items available'
    },
    cart: {
      title: 'Shopping Cart',
      emptyTitle: 'Your cart is empty',
      emptySubtitle: 'Add some products to get started!',
      browseProducts: 'Browse Products',
      itemsCount: '{count} items in your cart',
      summary: 'Order Summary',
      subtotal: 'Subtotal',
      tax: 'Tax',
      total: 'Total',
      proceedToCheckout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
      each: 'each'
    },
    checkout: {
      title: 'Checkout',
      subtitle: 'Complete your order',
      shippingInfo: 'Shipping Information',
      paymentInfo: 'Payment Information',
      placeOrder: 'Place Order',
      successTitle: 'Order Successful!',
      successDesc: 'Order #{id} has been placed successfully',
      failedTitle: 'Order Failed',
      continueToPayment: 'Continue to Payment',
      form: {
        fullName: 'Full Name',
        address: 'Address',
        city: 'City',
        postalCode: 'Postal Code',
        country: 'Country',
        placeholder: {
          fullName: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          postalCode: '10001',
          country: 'United States'
        }
      },
      paymentDetails: 'Payment Details',
      testMode: 'TEST MODE',
      securePaymentMercadoPago: 'Secure Payment via Mercado Pago',
      transactionFee: 'Processing Fee',
      orderValue: 'Order Value',
      totalToPay: 'Total to Pay',
      redirectMessage: 'You will be redirected to the secure Mercado Pago payment gateway to complete your purchase.',
      processing: 'Processing...',
      payWith: 'Pay {amount} with Mercado Pago',
      backToShipping: 'Back to Shipping',
      connectionErrorTitle: 'Connection Error',
      connectionErrorDesc: 'Payment gateway is unavailable. Please reload the page or check your connection.'
    },
    dashboard: {
      title: 'My Orders',
      subtitle: 'View and manage your order history',
      noOrders: 'No orders yet',
      noOrdersDesc: 'Start shopping to see your orders here',
      memberSince: 'Member since {date}',
      orderId: 'Order #{id}...',
      orderNotPaid: 'Payment not made',
      items: {
        one: '{count} item',
        other: '{count} items'
      },
      errorFetchingOrders: 'Error loading orders. Please try again.',
      view: 'View',
      hide: 'Hide',
      orderItems: 'Order Items',
      shippingInfo: 'Shipping Information',
      status: {
        completed: 'Completed',
        processing: 'Processing (Paid)',
        pending: 'Pending',
        cancelled: 'Cancelled',
        unknown: 'Unknown'
      }
    },
    auth: {
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Login to your account',
      signupTitle: 'Create Account',
      signupSubtitle: 'Join GameStore today',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginButton: 'Login',
      signupButton: 'Sign Up',
      loggingIn: 'Logging in...',
      creatingAccount: 'Creating account...',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      passwordsNoMatch: "Passwords don't match",
      passwordTooShort: 'Password must be at least 6 characters',
      successLogin: 'Welcome back!',
      successSignup: 'Account created!',
      loginError: 'Login failed',
      signupError: 'Registration failed'
    },
    inventory: {
      title: 'Inventory Manager',
      subtitle: 'Manage your product catalog and stock levels',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      updateProduct: 'Update Product',
      deleteConfirm: 'Are you sure you want to delete this product?',
      lowStockAlert: 'Low Stock Alert',
      lowStockDesc: '{count} product(s) have low stock levels',
      form: {
        name: 'Product Name',
        category: 'Category',
        price: 'Price (COP)',
        stock: 'Stock',
        type: 'Type / Game (ID)',
        imageUrl: 'Image URL',
        description: 'Description',
        selectCategory: 'Select category'
      },
      table: {
        product: 'Product',
        category: 'Category',
        price: 'Price (COP)',
        stock: 'Stock',
        actions: 'Actions'
      },
      errorAdd: 'Error adding product.',
      errorUpdate: 'Error updating product.',
      errorDelete: 'Error deleting product.',
      successUpdate: 'Product Updated',
      successAdd: 'Product Added',
      successDelete: 'Product Deleted'
    },
    ticket: {
      title: 'Order Ticket #{id}',
      status: { open: 'Open', closed: 'Closed' },
      subtitle: 'Receive your product and support here.',
      closeButton: 'Close Ticket',
      button: 'Ticket',
      closeConfirm: 'Are you sure you want to close this ticket?',
      welcome: 'Welcome to support. An agent will attend you shortly to deliver your product.',
      you: 'You',
      support: 'Support',
      placeholder: 'Type a message...',
      closedMessage: 'This ticket has been closed and completed.'
    },
    products: {
      '1': {
        name: 'Netflix Premium 1 Month',
        description: 'Netflix Premium subscription for 1 month. Includes 4K streaming and 4 simultaneous screens.'
      },
      'robux-currency': {
        name: 'Robux Coin',
        description: 'Quote and buy your Robux instantly'
      },
      '3': {
        name: 'Minecraft VIP Rank',
        description: 'VIP rank with exclusive perks and commands on our Minecraft server.'
      },
      '4': {
        name: '2800 V-Bucks',
        description: 'Fortnite V-Bucks for purchasing skins, emotes, and Battle Pass.'
      },
      '5': {
        name: 'Spotify Premium 3 Months',
        description: 'Spotify Premium for 3 months. Ad-free music streaming with offline downloads.'
      },
      '7': {
        name: 'Clash Royale Pass Royale',
        description: 'Season Pass with exclusive rewards, emotes, and tower skins.'
      },
      '8': {
        name: 'Minecraft MVP++ Rank',
        description: 'Ultimate MVP++ rank with all perks, commands, and exclusive cosmetics.'
      },
      // EXAMPLE: Add your new products here. Make sure the ID ('9') matches the one in the database.
      '9': {
        name: 'Discord Nitro 1 Month',
        description: 'Enjoy one month of Discord Nitro with custom emojis, higher quality uploads, and more.'
      }
    }
  },
  pt: {
    header: {
      home: 'Início',
      catalog: 'Catálogo',
      orders: 'Meus Pedidos',
      inventory: 'Estoque',
      tickets: 'Tickets',
      login: 'Entrar',
      logout: 'Sair',
      cart: 'Carrinho',
      search: 'Buscar...',
      welcome: 'Bem-vindo',
      hello: 'Olá'
    },
    calculator: {
      title: 'Calculadora de Robux',
      subtitle: 'Cote e compre seus Robux instantaneamente',
      amount: 'Quantidade de Robux',
      price: 'Preço Estimado',
      buy: 'Comprar Agora',
      productDescription: 'Descrição do Produto',
      quickSelect: 'Seleção Rápida',
      conversionRate: '1 R$ ≈ {rate}',
      instantDelivery: '(Entrega Imediata)',
      currencyName: 'Robux'
    },
    home: {
      heroTitlePrefix: 'Suba de Nível sua',
      heroTitleSuffix: 'Experiência Gamer',
      heroSubtitle: 'Acesso instantâneo a conteúdo premium, moeda virtual e vantagens exclusivas',
      browseCatalog: 'Ver Catálogo',
      getStarted: 'Começar',
      featuredTitle: 'Produtos em Destaque',
      featuredSubtitle: 'Confira nossos itens mais vendidos',
      viewAll: 'Ver Todos os Produtos',
      features: {
        securePayment: 'Pagamento Seguro',
        securePaymentDesc: 'Integração com Mercado Pago para transações seguras',
        fastDelivery: 'Entrega Rápida',
        fastDeliveryDesc: 'Entrega digital instantânea na sua conta',
        support: 'Suporte no Discord',
        supportDesc: 'Junte-se à nossa comunidade para suporte rápido!',
        bestPrices: 'Melhores Preços',
        bestPricesDesc: 'Preços competitivos em todos os produtos'
      },
      robuxCard: {
        badge: 'Calculadora',
        stock: 'Estoque Disponível',
        pricePerUnit: '{price} / 1R$'
      }
    },
    catalog: {
      title: 'Catálogo de Produtos',
      subtitle: 'Explore nossa coleção completa de produtos gaming',
      searchPlaceholder: 'Buscar produtos...',
      priceLowToHigh: 'Preço: Menor para Maior',
      priceHighToLow: 'Preço: Maior para Menor',
      noProducts: 'Nenhum produto encontrado',
      filters: 'Filtros',
      categories: {
        all: 'Todos',
        streaming: 'Streaming',
        robux: 'Robux',
        gamepasses: 'Passes de Jogo',
        minecraft: 'Minecraft',
        fortnite: 'Fortnite',
        'clash-royale': 'Clash Royale',
        'ingame-items': 'Itens de Jogos'
      },
      categoriesTitle: 'Categorias',
      allProducts: 'Todos os Produtos'
    },
    product: {
      backToCatalog: 'Voltar ao Catálogo',
      notFound: 'Produto não encontrado',
      addToCart: 'Adicionar',
      added: 'Adicionado',
      quantity: 'Quantidade',
      relatedProducts: 'Produtos Relacionados',
      instantDelivery: 'Entrega Instantânea',
      stock: {
        out: 'Esgotado',
        low: 'Apenas {stock} restantes!',
        in: 'Em Estoque'
      },
      addedToCart: 'Adicionado ao Carrinho',
      addedToCartDesc: '{quantity}x {name} adicionado ao seu carrinho',
      loginRequired: 'Login Necessário',
      loginRequiredDesc: 'Por favor, faça login para adicionar itens',
      insufficientStock: 'Estoque Insuficiente',
      insufficientStockDesc: 'Apenas {stock} itens disponíveis'
    },
    cart: {
      title: 'Carrinho de Compras',
      emptyTitle: 'Seu carrinho está vazio',
      emptySubtitle: 'Adicione alguns produtos para começar!',
      browseProducts: 'Explorar Produtos',
      itemsCount: '{count} itens no seu carrinho',
      summary: 'Resumo do Pedido',
      subtotal: 'Subtotal',
      tax: 'Impostos',
      total: 'Total',
      proceedToCheckout: 'Ir para o Pagamento',
      continueShopping: 'Continuar Comprando',
      each: 'cada'
    },
    checkout: {
      title: 'Finalizar Compra',
      subtitle: 'Complete seu pedido',
      shippingInfo: 'Informações de Envio',
      paymentInfo: 'Informações de Pagamento',
      placeOrder: 'Realizar Pedido',
      successTitle: 'Pedido Realizado!',
      successDesc: 'O pedido #{id} foi realizado com sucesso',
      failedTitle: 'Falha no Pedido',
      continueToPayment: 'Continuar para Pagamento',
      form: {
        fullName: 'Nome Completo',
        address: 'Endereço',
        city: 'Cidade',
        postalCode: 'Código Postal',
        country: 'País',
        placeholder: {
          fullName: 'João Silva',
          address: 'Av. Paulista 1000',
          city: 'São Paulo',
          postalCode: '01310-100',
          country: 'Brasil'
        }
      },
      paymentDetails: 'Detalhes do Pagamento',
      testMode: 'MODO TESTE',
      securePaymentMercadoPago: 'Pagamento Seguro via Mercado Pago',
      transactionFee: 'Taxa de Processamento',
      orderValue: 'Valor do Pedido',
      totalToPay: 'Total a Pagar',
      redirectMessage: 'Você será redirecionado para o gateway de pagamento seguro Mercado Pago para concluir sua compra.',
      processing: 'Processando...',
      payWith: 'Pagar {amount} com Mercado Pago',
      backToShipping: 'Voltar para Envio',
      connectionErrorTitle: 'Erro de Conexão',
      connectionErrorDesc: 'O gateway de pagamento não está disponível. Por favor, recarregue a página ou verifique sua conexão.'
    },
    dashboard: {
      title: 'Meus Pedidos',
      subtitle: 'Ver e gerenciar histórico de pedidos',
      noOrders: 'Nenhum pedido ainda',
      noOrdersDesc: 'Comece a comprar para ver seus pedidos aqui',
      memberSince: 'Membro desde {date}',
      orderId: 'Pedido #{id}...',
      orderNotPaid: 'Pagamento não realizado',
      items: {
        one: '{count} item',
        other: '{count} itens'
      },
      errorFetchingOrders: 'Erro ao carregar pedidos. Tente novamente.',
      view: 'Ver',
      hide: 'Ocultar',
      orderItems: 'Itens do Pedido',
      shippingInfo: 'Informações de Envio',
      status: {
        completed: 'Concluído',
        processing: 'Em Processamento (Pago)',
        pending: 'Pendente',
        cancelled: 'Cancelado',
        unknown: 'Desconhecido'
      }
    },
    auth: {
      loginTitle: 'Bem-vindo de Volta',
      loginSubtitle: 'Entre na sua conta',
      signupTitle: 'Criar Conta',
      signupSubtitle: 'Junte-se à GameStore hoje',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      loginButton: 'Entrar',
      signupButton: 'Cadastrar',
      loggingIn: 'Entrando...',
      creatingAccount: 'Criando conta...',
      noAccount: 'Não tem uma conta?',
      hasAccount: 'Já tem uma conta?',
      passwordsNoMatch: 'As senhas não coincidem',
      passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
      successLogin: 'Bem-vindo de volta!',
      successSignup: 'Conta criada!',
      loginError: 'Erro ao iniciar sessão',
      signupError: 'Erro ao registrar'
    },
    inventory: {
      title: 'Gerenciador de Estoque',
      subtitle: 'Gerenciar catálogo de produtos e níveis de estoque',
      addProduct: 'Adicionar Produto',
      editProduct: 'Editar Produto',
      updateProduct: 'Atualizar Produto',
      deleteConfirm: 'Tem certeza que deseja excluir este produto?',
      lowStockAlert: 'Alerta de Baixo Estoque',
      lowStockDesc: '{count} produto(s) com níveis baixos de estoque',
      form: {
        name: 'Nome do Produto',
        category: 'Categoria',
        price: 'Preço (COP)',
        stock: 'Estoque',
        type: 'Tipo / Jogo (ID)',
        imageUrl: 'URL da Imagem',
        description: 'Descrição',
        selectCategory: 'Selecionar categoria'
      },
      table: {
        product: 'Produto',
        category: 'Categoria',
        price: 'Preço (COP)',
        stock: 'Estoque',
        actions: 'Ações'
      },
      errorAdd: 'Erro ao adicionar produto.',
      errorUpdate: 'Erro ao atualizar produto.',
      errorDelete: 'Erro ao excluir produto.',
      successUpdate: 'Produto Atualizado',
      successAdd: 'Produto Adicionado',
      successDelete: 'Produto Excluído'
    },
    ticket: {
      title: 'Ticket do Pedido #{id}',
      status: { open: 'Aberto', closed: 'Fechado' },
      subtitle: 'Receba seu produto e suporte aqui.',
      closeButton: 'Fechar Ticket',
      button: 'Ticket',
      closeConfirm: 'Tem certeza que deseja fechar este ticket?',
      welcome: 'Bem-vindo ao suporte. Um agente irá atendê-lo em breve para entregar seu produto.',
      you: 'Você',
      support: 'Suporte',
      placeholder: 'Digite uma mensagem...',
      closedMessage: 'Este ticket foi fechado e concluído.'
    },
    products: {
      '1': {
        name: 'Netflix Premium 1 Mês',
        description: 'Assinatura Netflix Premium por 1 mês. Inclui streaming em 4K e 4 telas simultâneas.'
      },
      'robux-currency': {
        name: 'Moeda Robux',
        description: 'Cote e compre seus Robux instantaneamente'
      },
      '3': {
        name: 'Rank VIP Minecraft',
        description: 'Rank VIP com vantagens exclusivas e comandos em nosso servidor Minecraft.'
      },
      '4': {
        name: '2800 V-Bucks',
        description: 'V-Bucks do Fortnite para comprar skins, emotes e Passe de Batalha.'
      },
      '5': {
        name: 'Spotify Premium 3 Meses',
        description: 'Spotify Premium por 3 meses. Música sem anúncios com downloads offline.'
      },
      '7': {
        name: 'Pass Royale Clash Royale',
        description: 'Passe de Temporada com recompensas exclusivas, emotes e visuais de torre.'
      },
      '8': {
        name: 'Rank MVP++ Minecraft',
        description: 'Rank definitivo MVP++ com todas as vantagens, comandos e cosméticos exclusivos.'
      },
      // EXEMPLO: Adicione seus novos produtos aqui. Certifique-se de que o ID ('9') corresponde ao do banco de dados.
      '9': {
        name: 'Discord Nitro 1 Mês',
        description: 'Aproveite um mês de Discord Nitro com emojis personalizados, uploads de maior qualidade e muito mais.'
      }
    }
  }
};