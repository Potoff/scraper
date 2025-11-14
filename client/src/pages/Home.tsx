import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Mail, Download } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [department, setDepartment] = useState("");
  const [sector, setSector] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const startSearchMutation = trpc.scraping.startSearch.useMutation({
    onSuccess: (data) => {
      navigate(`/results/${data.searchId}`, { replace: true });
    },
    onError: (error) => {
      console.error("Search failed:", error);
      setIsSearching(false);
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department.trim() || !sector.trim()) {
      return;
    }
    setIsSearching(true);
    startSearchMutation.mutate({
      department: department.trim(),
      sector: sector.trim(),
    });
  };

  // Authentication disabled for testing
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
  //       <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
  //       <div className="max-w-md w-full">
  //         <Card className="shadow-lg">
  //           <CardHeader className="text-center">
  //             <div className="flex justify-center mb-4">
  //               <Mail className="w-12 h-12 text-indigo-600" />
  //             </div>
  //             <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
  //             <CardDescription>
  //               Trouvez les adresses e-mail publiques d'entreprises locales
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <p className="text-sm text-gray-600 mb-6">
  //               Connectez-vous pour commencer à scraper les e-mails d'entreprises par département et secteur.
  //             </p>
  //             <a href={getLoginUrl()}>
  //               <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
  //                 Se connecter
  //               </Button>
  //             </a>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="text-sm text-gray-600">
            Bienvenue, <span className="font-semibold">{user?.name || "Utilisateur"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Search Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Nouvelle recherche
                </CardTitle>
                <CardDescription>
                  Entrez le département et le secteur d'activité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      placeholder="Ex: Paris, Île-de-France, 75..."
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isSearching}
                    />
                    <p className="text-xs text-gray-500">
                      Entrez le nom du département ou le numéro (75, 92, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Secteur d'activité</Label>
                    <Input
                      id="sector"
                      placeholder="Ex: Plomberie, Électricité, Coiffure..."
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      disabled={isSearching}
                    />
                    <p className="text-xs text-gray-500">
                      Spécifiez le type d'entreprises à rechercher
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isSearching || !department.trim() || !sector.trim()}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Recherche en cours...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Lancer la recherche
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Comment ça fonctionne ?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>
                  ✓ Entrez un département et un secteur d'activité
                </p>
                <p>
                  ✓ L'outil recherche les entreprises correspondantes
                </p>
                <p>
                  ✓ Les adresses e-mail publiques sont extraites
                </p>
                <p>
                  ✓ Exportez les résultats en CSV
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Fonctionnalités
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Recherche intelligente</h3>
                    <p className="text-sm text-gray-600">
                      Trouvez les entreprises locales par département et secteur
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Extraction d'e-mails</h3>
                    <p className="text-sm text-gray-600">
                      Récupérez les adresses e-mail publiques depuis les sites web
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Export facile</h3>
                    <p className="text-sm text-gray-600">
                      Téléchargez vos résultats au format CSV
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg">Historique des recherches</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/history", { replace: false })}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Voir l'historique
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
