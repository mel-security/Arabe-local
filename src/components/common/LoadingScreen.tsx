export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-sand-50 dark:bg-gray-950 z-50">
      <div className="text-center animate-fade-in">
        {/* Logo arabe */}
        <div className="arabic-text text-arabic-2xl text-gradient-gold mb-4 animate-float">
          عربي
        </div>
        <p className="text-sand-600 dark:text-gray-400 text-sm font-medium mb-6">
          Chargement en cours...
        </p>
        {/* Barre de chargement */}
        <div className="w-48 h-1 bg-sand-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse-slow" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}
