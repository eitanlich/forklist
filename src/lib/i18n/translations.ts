export const translations = {
  en: {
    // Navigation
    home: "Home",
    history: "History",
    
    // Home page
    welcomeBack: "Welcome back",
    searchForRestaurant: "Search for a restaurant",
    places: "Places",
    visits: "visits",
    rating: "Rating",
    average: "average",
    cuisine: "Cuisine",
    noVisitsYet: "No visits logged yet. Start exploring!",
    logAVisit: "Log a Visit",
    myHistory: "My History",
    
    // Add page
    searchRestaurants: "Search for the restaurant you visited",
    searchPlaceholder: "Search restaurants...",
    startTyping: "Start typing to search for a restaurant",
    detectingLocation: "Detecting location...",
    nearMe: "Near me",
    global: "Global",
    searchCountries: "Search countries...",
    popularCountries: "Popular countries:",
    resultsFor: "Results for",
    noCountriesFound: "No countries found",
    orSelectCountry: "Or select country:",
    changeRestaurant: "Change restaurant",
    loadingRestaurant: "Loading restaurant...",
    pressEnterForMore: "Press Enter for more results",
    clearResults: "Clear",
    noResultsFound: "No restaurants found",
    loadMore: "Load more",
    
    // Review form
    overall: "Overall",
    food: "Food",
    service: "Service",
    ambiance: "Ambiance",
    priceValue: "Price / Value",
    occasion: "Occasion",
    dateNight: "Date Night",
    friends: "Friends",
    family: "Family",
    business: "Business",
    solo: "Solo",
    other: "Other",
    notes: "Notes",
    optional: "optional",
    notesPlaceholder: "What stood out? Anything you'd recommend?",
    dateVisited: "Date visited",
    selectDate: "Select date",
    saveReview: "Save Review",
    saving: "Saving...",
    rateAllCategories: "Rate all 5 categories to save",
    
    // History
    yourReviews: "Your Reviews",
    reviewCount: "reviews",
    noReviewsFound: "No reviews found",
    
    // Edit/Delete
    editReview: "Edit Review",
    deleteReview: "Delete Review",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    back: "Back",
    areYouSure: "Are you sure?",
    deleteWarning: "This action cannot be undone. This will permanently delete your review.",
    deleting: "Deleting...",
    
    // Common
    maps: "Maps",
    website: "Website",
    visited: "Visited",
    priceShort: "Price",
    noReviewsYet: "No reviews yet",
    startLogging: "Start logging your restaurant visits",
    logFirstVisit: "Log your first visit",
    
    // Settings
    language: "Language",
    settings: "Settings",
    signOut: "Sign out",
  },
  
  es: {
    // Navigation
    home: "Inicio",
    history: "Historial",
    
    // Home page
    welcomeBack: "Hola de nuevo",
    searchForRestaurant: "Buscar un restaurante",
    places: "Lugares",
    visits: "visitas",
    rating: "Rating",
    average: "promedio",
    cuisine: "Cocina",
    noVisitsYet: "No hay visitas registradas. ¡Empezá a explorar!",
    logAVisit: "Registrar visita",
    myHistory: "Mi historial",
    
    // Add page
    searchRestaurants: "Buscá el restaurante que visitaste",
    searchPlaceholder: "Buscar restaurantes...",
    startTyping: "Empezá a escribir para buscar un restaurante",
    detectingLocation: "Detectando ubicación...",
    nearMe: "Cerca mío",
    global: "Global",
    searchCountries: "Buscar países...",
    popularCountries: "Países populares:",
    resultsFor: "Resultados para",
    noCountriesFound: "No se encontraron países",
    orSelectCountry: "O seleccioná un país:",
    changeRestaurant: "Cambiar restaurante",
    loadingRestaurant: "Cargando restaurante...",
    pressEnterForMore: "Presioná Enter para más resultados",
    clearResults: "Limpiar",
    noResultsFound: "No se encontraron restaurantes",
    loadMore: "Cargar más",
    
    // Review form
    overall: "General",
    food: "Comida",
    service: "Servicio",
    ambiance: "Ambiente",
    priceValue: "Precio / Valor",
    occasion: "Ocasión",
    dateNight: "Cita",
    friends: "Amigos",
    family: "Familia",
    business: "Trabajo",
    solo: "Solo",
    other: "Otro",
    notes: "Notas",
    optional: "opcional",
    notesPlaceholder: "¿Qué te llamó la atención? ¿Algo que recomendarías?",
    dateVisited: "Fecha de visita",
    selectDate: "Elegir fecha",
    saveReview: "Guardar review",
    saving: "Guardando...",
    rateAllCategories: "Calificá las 5 categorías para guardar",
    
    // History
    yourReviews: "Tus reviews",
    reviewCount: "reviews",
    noReviewsFound: "No se encontraron reviews",
    
    // Edit/Delete
    editReview: "Editar review",
    deleteReview: "Eliminar review",
    saveChanges: "Guardar cambios",
    cancel: "Cancelar",
    back: "Volver",
    areYouSure: "¿Estás seguro?",
    deleteWarning: "Esta acción no se puede deshacer. Se eliminará permanentemente tu review.",
    deleting: "Eliminando...",
    
    // Common
    maps: "Mapa",
    website: "Web",
    visited: "Visitado",
    priceShort: "Precio",
    noReviewsYet: "Sin reviews todavía",
    startLogging: "Empezá a registrar tus visitas a restaurantes",
    logFirstVisit: "Registrar tu primera visita",
    
    // Settings
    language: "Idioma",
    settings: "Configuración",
    signOut: "Cerrar sesión",
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
