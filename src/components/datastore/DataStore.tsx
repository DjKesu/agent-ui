import React, { useEffect } from "react";
import { useAtomValue } from "jotai";
import { CollectionsView } from "../vectordb/CollectionsView";
import { EmbeddingModelSelector } from "../vectordb/EmbeddingModelSelector";
import { pluginStatesAtom } from "../../store/store";

interface DatabaseService {
    id: string;
    name: string;
    isInstalled: boolean;
    component: React.ComponentType<any>;
}

export const DataStore: React.FC = () => {
    const pluginStates = useAtomValue(pluginStatesAtom);
    const isChromaInstalled = pluginStates['chromadb']?.isInstalled || false;

    // List of available database services
    const databaseServices: DatabaseService[] = [
        {
            id: 'chromadb',
            name: 'ChromaDB',
            isInstalled: isChromaInstalled,
            component: CollectionsView
        }
        // Add more database services here as needed
    ];

    const [activeService, setActiveService] = React.useState<string | null>(null);

    // Set first installed service as active by default
    useEffect(() => {
        const installedServices = databaseServices.filter(service => service.isInstalled);
        if (installedServices.length > 0 && !activeService) {
            setActiveService(installedServices[0].id);
        }
    }, [databaseServices, activeService]);

    const ActiveComponent = databaseServices.find(
        service => service.id === activeService
    )?.component;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col space-y-6">
                {/* Database Service Selector */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold mb-4">Data Services</h2>
                    <div className="flex flex-wrap gap-2">
                        {databaseServices.map(service => (
                            service.isInstalled && (
                                <button
                                    key={service.id}
                                    onClick={() => setActiveService(service.id)}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        activeService === service.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {service.name}
                                </button>
                            )
                        ))}
                    </div>
                </div>

                {/* Active Service Configuration */}
                {activeService === 'chromadb' && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-4">Embedding Model Configuration</h3>
                        <EmbeddingModelSelector />
                    </div>
                )}

                {/* Active Service Content */}
                {ActiveComponent && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <ActiveComponent />
                    </div>
                )}

                {/* No Services Message */}
                {databaseServices.filter(service => service.isInstalled).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No database services installed.</p>
                        <p className="mt-2">
                            Visit the store to install database services for your application.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}; 