// CheckoutStep3_Confirmacao.tsx
export default function CheckoutStep3({ formData, onBack }: any) {
    const handleFinalizar = () => {
        console.log("Dados finais:", formData);
        alert("Compra confirmada!");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center mb-6 w-full max-w-2xl">
                <div className="flex items-center w-full">
                    <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">1</div>
                    <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
                    <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">2</div>
                    <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
                    <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                </div>
            </div>

            <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
                <h2 className="text-2xl font-semibold text-rose-300 mb-4">Confirmação</h2>
                <p className="text-gray-600 mb-4">Revise os dados do seu pedido antes de finalizar.</p>

                <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <pre className="text-sm text-gray-600">{JSON.stringify(formData, null, 2)}</pre>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md transition"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={handleFinalizar}
                        className="flex-1 bg-rose-300 hover:bg-rose-600 text-white font-semibold py-2 rounded-md transition"
                    >
                        Finalizar Compra
                    </button>
                </div>
            </div>
        </div>
    );
}
