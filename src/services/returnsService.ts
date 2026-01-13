// src/services/returnsService.ts

export async function createReturnTicket(payload: any) {
  console.group("📨 [FAKE] createReturnTicket");
  console.log("Payload enviado:", payload);
  console.groupEnd();

  // simula um pequeno delay de API
  await new Promise((resolve) => setTimeout(resolve, 800));

  // retorno fake
  return {
    success: true,
    ticket_id: "fake-ticket-123",
  };
}
