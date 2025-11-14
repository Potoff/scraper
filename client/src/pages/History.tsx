import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Clock, Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function History() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: searches = [], isLoading } = trpc.scraping.getHistory.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
          <Button onClick={() => navigate("/")}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historique des recherches</h1>
            <p className="text-sm text-gray-600">Vos recherches précédentes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : searches.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune recherche n'a été effectuée</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/")}
              >
                Effectuer une recherche
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <Card key={search.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {search.sector} - {search.department}
                      </CardTitle>
                      <CardDescription>
                        {new Date(search.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          search.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : search.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : search.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {search.status === "completed"
                          ? "Terminée"
                          : search.status === "processing"
                          ? "En cours"
                          : search.status === "pending"
                          ? "En attente"
                          : "Erreur"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {search.totalResults ?? 0}
                      </span>{" "}
                      adresse(s) e-mail trouvée(s)
                    </div>
                    {search.status === "completed" && (search.totalResults ?? 0) > 0 && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/results/${search.id}`)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les résultats
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
