export default function CheckoutStep2({ onNext, onBack, updateData }: any) {
    const handlePagamento = () => {
        updateData({ pagamento: { metodo: "pix", valor: 200 } });
        onNext();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center mb-6 w-full max-w-2xl">
                <div className="flex items-center w-full">
                    <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">1</div>
                    <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
                    <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
                    <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">3</div>
                </div>
            </div>

            <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
                <h2 className="text-2xl font-semibold text-rose-300 mb-4">Pagamento</h2>
                <p className="text-gray-600 mb-4">Selecione o método de pagamento para continuar.</p>

                {/* Payment options */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <button className="bg-gray-100 px-4 py-2 rounded-md hover:bg-rose-100 transition focus:outline-none focus:ring-2 focus:ring-rose-300">PIX</button>
                    <button className="bg-gray-100 px-4 py-2 rounded-md hover:bg-rose-100 transition focus:outline-none focus:ring-2 focus:ring-rose-300">Cartão</button>
                    <button className="bg-gray-100 px-4 py-2 rounded-md hover:bg-rose-100 transition focus:outline-none focus:ring-2 focus:ring-rose-300">Boleto</button>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md transition"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={handlePagamento}
                        className="flex-1 bg-rose-300 hover:bg-rose-600 text-white font-semibold py-2 rounded-md transition"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
}
