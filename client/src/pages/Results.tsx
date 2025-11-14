import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, ArrowLeft, Mail, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface ResultsPageProps {
  params: {
    searchId: string;
  };
}

export default function Results({ params }: ResultsPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const searchId = parseInt(params.searchId, 10);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch search details
  const { data: search, isLoading: searchLoading } = trpc.scraping.getSearch.useQuery(
    { searchId },
    { refetchInterval: autoRefresh ? 2000 : false }
  );

  // Fetch results
  const { data: results = [], isLoading: resultsLoading } = trpc.scraping.getResults.useQuery(
    { searchId },
    { refetchInterval: autoRefresh ? 2000 : false }
  );

  // Stop auto-refresh when search is completed
  useEffect(() => {
    if (search?.status === "completed" || search?.status === "failed") {
      setAutoRefresh(false);
    }
  }, [search?.status]);

  const isProcessing = search?.status === "pending" || search?.status === "processing";

  const handleExportCSV = () => {
    if (!results || results.length === 0) {
      return;
    }

    // Prepare CSV content
    const headers = ["Entreprise", "E-mail", "Site web", "Téléphone", "Adresse", "Ville"];
    const csvContent = [
      headers.join(","),
      ...results.map((result) =>
        [
          `"${result.businessName.replace(/"/g, '""')}"`,
          `"${result.email}"`,
          `"${result.website || ""}"`,
          `"${result.phone || ""}"`,
          `"${(result.address || "").replace(/"/g, '""')}"`,
          `"${result.city || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `recherche_${search?.department}_${search?.sector}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              <h1 className="text-xl font-bold text-gray-900">Résultats de recherche</h1>
              {search && (
                <p className="text-sm text-gray-600">
                  {search.sector} - {search.department}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Card */}
        {search && (
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <div>
                        <CardTitle className="text-base">Recherche en cours...</CardTitle>
                        <CardDescription>
                          L'outil analyse les entreprises et extrait les e-mails
                        </CardDescription>
                      </div>
                    </>
                  ) : search.status === "completed" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <CardTitle className="text-base">Recherche terminée</CardTitle>
                        <CardDescription>
                          {results.length} adresse(s) e-mail trouvée(s)
                        </CardDescription>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-red-600" />
                      <div>
                        <CardTitle className="text-base">Erreur</CardTitle>
                        <CardDescription>{search.errorMessage || "Une erreur s'est produite"}</CardDescription>
                      </div>
                    </>
                  )}
                </div>
                {!isProcessing && results.length > 0 && (
                  <Button
                    onClick={handleExportCSV}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter en CSV
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Results Table */}
        {!searchLoading && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Adresses e-mail trouvées ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {isProcessing
                      ? "Aucun résultat pour le moment. La recherche est en cours..."
                      : "Aucune adresse e-mail n'a été trouvée pour cette recherche."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Entreprise
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          E-mail
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Site web
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Téléphone
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Adresse
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr
                          key={result.id}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {result.businessName}
                          </td>
                          <td className="py-3 px-4">
                            <a
                              href={`mailto:${result.email}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {result.email}
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            {result.website ? (
                              <a
                                href={result.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline truncate"
                              >
                                {result.website}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {result.phone || "-"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                            {result.address || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
