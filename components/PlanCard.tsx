"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import React from "react";

type Plan = {
  name: string;
  price: number;
  frequency: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
};

const plans: Plan[] = [
  {
    name: "Start",
    price: 5,
    frequency: "/mes",
    description: "Comenzá con lo básico y organizá tu práctica profesional.",
    features: [
      "Acceso al Marketplace",
      "Tarjeta de presentación",
      "Comunidad de profesionales",
      "Gestión de agenda",
      "Reserva de turnos",
      "Recordatorios por WhatsApp",
      "Historia clínica digital",
      "Pagos y facturación",
      "Funcionalidades con IA",
      "Gestión hasta 3 pacientes",
      "Soporte",
    ],
    isCurrent: true,
  },
  {
    name: "Plus",
    price: 19,
    frequency: "/mes",
    description: "Ganá control total de tu profesión con una gestión avanzada.",
    features: [
      "Todo lo del plan Start",
      "Hasta 10 pacientes",
      "Métricas y análisis",
      "Menty (IA)",
      "Soporte prioritario",
    ],
  },
  {
    name: "Pro",
    price: 26,
    frequency: "/mes",
    description: "Liderá tu campo con todas las herramientas y funcionalidades.",
    features: [
      "Todo lo del plan Plus",
      "Pacientes ilimitados",
      "Videollamadas con resumen",
      "Cartera privada empresas",
      "Menty completo (IA)",
      "Posicionamiento profesional",
      "Métricas avanzadas",
      "Descuentos y beneficios",
      "Capacitaciones",
    ],
  },
];

const PlanCard = ({ plan }: { plan: Plan }) => {
  return (
    <Card className="relative flex flex-col justify-between shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
          {plan.isCurrent && <Badge variant="secondary">Plan actual</Badge>}
        </div>
        <div className="text-3xl font-bold text-primary mt-2">
          USD {plan.price} <span className="text-sm font-normal">{plan.frequency}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-2">
        <ul className="text-sm space-y-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 text-purple-600 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {!plan.isCurrent && (
          <Button className="w-full mt-4" variant="default">
            Elegir {plan.name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default function PlanSection() {
  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-bold text-center mb-6">Elige tu plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}
