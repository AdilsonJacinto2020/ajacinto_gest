export const COMPANY_INFO = {
  name: "ADIJACINTO – COMÉRCIO GREAL E PRESTAÇÃO DE SERVIÇOS (SU), LDA.",
  shortName: "ADIJACINTO",
  nif: "5001375962",
  address: "Luanda, Município de Luanda, Distrito Urbano de Samba, Bairro Morro Bento, Rua e Casa s/nº, junto ao Imetro",
  phone: "947 501 108 / 940 030 860",
  email: "contacto@adijacinto.ao",
  footerNotice: "Documento emitido para comprovação interna de recargas e serviços de telecomunicações/TV.",
};

export type Operator = "UNITEL" | "AFRICELL" | "ZAP" | "DSTV";

export interface CatalogItem {
  id: string;
  operator: Operator;
  category: string;
  name: string;
  price: number;
  recipientType: "TELEFONE" | "CARTAO";
  editablePrice?: boolean;
}

export const INITIAL_PRODUCTS: CatalogItem[] = [
  // ================= UNITEL (mSeller) =================
  { id: "u-v-1", operator: "UNITEL", category: "Voz & Saldo", name: "Optimo 24h", price: 300, recipientType: "TELEFONE" },
  { id: "u-v-2", operator: "UNITEL", category: "Voz & Saldo", name: "350KZ Recarga", price: 350, recipientType: "TELEFONE" },
  { id: "u-v-3", operator: "UNITEL", category: "Voz & Saldo", name: "Optimo 72h (400)", price: 400, recipientType: "TELEFONE" },
  { id: "u-v-4", operator: "UNITEL", category: "Voz & Saldo", name: "Fala tudo 1D", price: 500, recipientType: "TELEFONE" },
  { id: "u-v-5", operator: "UNITEL", category: "Voz & Saldo", name: "500KZ Recarga", price: 500, recipientType: "TELEFONE" },
  { id: "u-v-6", operator: "UNITEL", category: "Voz & Saldo", name: "Optimo 72h (500)", price: 500, recipientType: "TELEFONE" },
  { id: "u-v-7", operator: "UNITEL", category: "Voz & Saldo", name: "BALA 7D (625 Kz)", price: 625, recipientType: "TELEFONE" },
  { id: "u-v-8", operator: "UNITEL", category: "Voz & Saldo", name: "Optimo 7D", price: 1000, recipientType: "TELEFONE" },
  { id: "u-v-9", operator: "UNITEL", category: "Voz & Saldo", name: "Fala tudo 3D", price: 1000, recipientType: "TELEFONE" },
  { id: "u-v-10", operator: "UNITEL", category: "Voz & Saldo", name: "1000KZ Recarga", price: 1000, recipientType: "TELEFONE" },
  { id: "u-v-11", operator: "UNITEL", category: "Voz & Saldo", name: "BALA 7D (1.250 Kz)", price: 1250, recipientType: "TELEFONE" },
  { id: "u-v-12", operator: "UNITEL", category: "Voz & Saldo", name: "2000KZ Recarga", price: 2000, recipientType: "TELEFONE" },
  { id: "u-v-13", operator: "UNITEL", category: "Voz & Saldo", name: "Plano BASE", price: 2000, recipientType: "TELEFONE" },
  { id: "u-v-14", operator: "UNITEL", category: "Voz & Saldo", name: "Mais Optimo 7D", price: 2000, recipientType: "TELEFONE" },
  { id: "u-v-15", operator: "UNITEL", category: "Voz & Saldo", name: "BALA 7D (2.500 Kz)", price: 2500, recipientType: "TELEFONE" },
  { id: "u-v-16", operator: "UNITEL", category: "Voz & Saldo", name: "Optimo 30D", price: 3500, recipientType: "TELEFONE" },
  { id: "u-v-17", operator: "UNITEL", category: "Voz & Saldo", name: "5000KZ Recarga", price: 5000, recipientType: "TELEFONE" },
  { id: "u-v-18", operator: "UNITEL", category: "Voz & Saldo", name: "BALA 7D (6.250 Kz)", price: 6250, recipientType: "TELEFONE" },
  { id: "u-v-19", operator: "UNITEL", category: "Voz & Saldo", name: "10000KZ Recarga", price: 10000, recipientType: "TELEFONE" },
  { id: "u-v-20", operator: "UNITEL", category: "Voz & Saldo", name: "BALA 7D (12.500 Kz)", price: 12500, recipientType: "TELEFONE" },
  { id: "u-v-21", operator: "UNITEL", category: "Voz & Saldo", name: "Roaming NBIA (15.000 Kz)", price: 15000, recipientType: "TELEFONE" },
  { id: "u-v-22", operator: "UNITEL", category: "Voz & Saldo", name: "Roaming EAU (30.000 Kz)", price: 30000, recipientType: "TELEFONE" },
  { id: "u-v-23", operator: "UNITEL", category: "Voz & Saldo", name: "Roaming NBIA (45.000 Kz)", price: 45000, recipientType: "TELEFONE" },

  // Unitel Dados
  { id: "u-d-1", operator: "UNITEL", category: "Dados", name: "Net 24h", price: 300, recipientType: "TELEFONE" },
  { id: "u-d-2", operator: "UNITEL", category: "Dados", name: "Social 1D", price: 300, recipientType: "TELEFONE" },
  { id: "u-d-3", operator: "UNITEL", category: "Dados", name: "Bala 24h", price: 300, recipientType: "TELEFONE" },
  { id: "u-d-4", operator: "UNITEL", category: "Dados", name: "Bala 72h (400 Kz)", price: 400, recipientType: "TELEFONE" },
  { id: "u-d-5", operator: "UNITEL", category: "Dados", name: "Bala 1D", price: 400, recipientType: "TELEFONE" },
  { id: "u-d-6", operator: "UNITEL", category: "Dados", name: "800MB Dados", price: 500, recipientType: "TELEFONE" },
  { id: "u-d-7", operator: "UNITEL", category: "Dados", name: "NET 750MB 3D", price: 500, recipientType: "TELEFONE" },
  { id: "u-d-8", operator: "UNITEL", category: "Dados", name: "Social 3D", price: 500, recipientType: "TELEFONE" },
  { id: "u-d-9", operator: "UNITEL", category: "Dados", name: "Bala 72h (500 Kz)", price: 500, recipientType: "TELEFONE" },
  { id: "u-d-10", operator: "UNITEL", category: "Dados", name: "Navega Tudo 1D", price: 500, recipientType: "TELEFONE" },
  { id: "u-d-11", operator: "UNITEL", category: "Dados", name: "600KZ Dados", price: 600, recipientType: "TELEFONE" },
  { id: "u-d-12", operator: "UNITEL", category: "Dados", name: "Plus 1.5GB", price: 750, recipientType: "TELEFONE" },
  { id: "u-d-13", operator: "UNITEL", category: "Dados", name: "Bala 72h (800 Kz)", price: 800, recipientType: "TELEFONE" },
  { id: "u-d-14", operator: "UNITEL", category: "Dados", name: "7D 1000KZ", price: 1000, recipientType: "TELEFONE" },
  { id: "u-d-15", operator: "UNITEL", category: "Dados", name: "Navega Tudo 3D", price: 1000, recipientType: "TELEFONE" },
  { id: "u-d-16", operator: "UNITEL", category: "Dados", name: "NET DIA 2GB", price: 1000, recipientType: "TELEFONE" },
  { id: "u-d-17", operator: "UNITEL", category: "Dados", name: "Plus 3 GB", price: 1500, recipientType: "TELEFONE" },
  { id: "u-d-18", operator: "UNITEL", category: "Dados", name: "NET 3GB", price: 1500, recipientType: "TELEFONE" },
  { id: "u-d-19", operator: "UNITEL", category: "Dados", name: "Net 4GB 7D", price: 2000, recipientType: "TELEFONE" },
  { id: "u-d-20", operator: "UNITEL", category: "Dados", name: "Navega Tudo 7D", price: 2000, recipientType: "TELEFONE" },
  { id: "u-d-21", operator: "UNITEL", category: "Dados", name: "NET 10GB", price: 4000, recipientType: "TELEFONE" },
  { id: "u-d-22", operator: "UNITEL", category: "Dados", name: "BALA 30D (5.000 Kz)", price: 5000, recipientType: "TELEFONE" },
  { id: "u-d-23", operator: "UNITEL", category: "Dados", name: "NET 7GB", price: 5000, recipientType: "TELEFONE" },
  { id: "u-d-24", operator: "UNITEL", category: "Dados", name: "BALA 30D (10.000 Kz)", price: 10000, recipientType: "TELEFONE" },
  { id: "u-d-25", operator: "UNITEL", category: "Dados", name: "NET 15GB", price: 10000, recipientType: "TELEFONE" },
  { id: "u-d-26", operator: "UNITEL", category: "Dados", name: "BALA 30D (18.000 Kz)", price: 18000, recipientType: "TELEFONE" },
  { id: "u-d-27", operator: "UNITEL", category: "Dados", name: "NET 4G 40GB 30D", price: 20000, recipientType: "TELEFONE" },
  { id: "u-d-28", operator: "UNITEL", category: "Dados", name: "BALA 60D (30.000 Kz)", price: 30000, recipientType: "TELEFONE" },
  { id: "u-d-29", operator: "UNITEL", category: "Dados", name: "30D 40.000 Kz", price: 40000, recipientType: "TELEFONE" },
  { id: "u-d-30", operator: "UNITEL", category: "Dados", name: "BALA 60D (50.000 Kz)", price: 50000, recipientType: "TELEFONE" },
  { id: "u-d-31", operator: "UNITEL", category: "Dados", name: "NET 4G ILIM 30D", price: 80000, recipientType: "TELEFONE" },
  { id: "u-d-32", operator: "UNITEL", category: "Dados", name: "200GB ANO", price: 100000, recipientType: "TELEFONE" },

  // Unitel Net Casa
  { id: "u-c-1", operator: "UNITEL", category: "Net Casa", name: "Net Casa 7.000 AKZ", price: 7000, recipientType: "TELEFONE" },
  { id: "u-c-2", operator: "UNITEL", category: "Net Casa", name: "Net Casa 10.000 AKZ", price: 10000, recipientType: "TELEFONE" },
  { id: "u-c-3", operator: "UNITEL", category: "Net Casa", name: "Net Casa 24.250 AKZ", price: 24250, recipientType: "TELEFONE" },
  { id: "u-c-4", operator: "UNITEL", category: "Net Casa", name: "Net Casa 35.000 AKZ", price: 35000, recipientType: "TELEFONE" },

  // ================= AFRICELL (Afrimoney) =================
  { id: "a-v-1", operator: "AFRICELL", category: "Voz & SMS", name: "40Min + 40SMS (24h)", price: 200, recipientType: "TELEFONE" },
  { id: "a-v-2", operator: "AFRICELL", category: "Voz & SMS", name: "70Min + 50SMS (24h)", price: 300, recipientType: "TELEFONE" },
  { id: "a-v-3", operator: "AFRICELL", category: "Voz & SMS", name: "60Min + 60SMS (3d)", price: 300, recipientType: "TELEFONE" },
  { id: "a-v-4", operator: "AFRICELL", category: "Voz & SMS", name: "90Min + 90SMS (3d)", price: 400, recipientType: "TELEFONE" },
  { id: "a-v-5", operator: "AFRICELL", category: "Voz & SMS", name: "120Min + 120SMS (3d)", price: 500, recipientType: "TELEFONE" },
  { id: "a-v-6", operator: "AFRICELL", category: "Voz & SMS", name: "160Min + 160SMS (3d)", price: 700, recipientType: "TELEFONE" },
  { id: "a-v-7", operator: "AFRICELL", category: "Voz & SMS", name: "170Min + 170SMS (7d)", price: 850, recipientType: "TELEFONE" },
  { id: "a-v-8", operator: "AFRICELL", category: "Voz & SMS", name: "200Min + 200SMS (7d)", price: 1000, recipientType: "TELEFONE" },
  { id: "a-v-9", operator: "AFRICELL", category: "Voz & SMS", name: "250Min + 200SMS (30d)", price: 1500, recipientType: "TELEFONE" },
  { id: "a-v-10", operator: "AFRICELL", category: "Voz & SMS", name: "400Min + 400SMS (30d)", price: 2000, recipientType: "TELEFONE" },
  { id: "a-v-11", operator: "AFRICELL", category: "Voz & SMS", name: "750Min + 750SMS (30d)", price: 3500, recipientType: "TELEFONE" },

  // Promoção Afrimoney / Afrinet
  { id: "a-p-1", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Afrinet 500MB (24h)", price: 200, recipientType: "TELEFONE" },
  { id: "a-p-2", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Tudo e Todos 500MB + 30Min + 30SMS (24h)", price: 300, recipientType: "TELEFONE" },
  { id: "a-p-3", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Fala com Todos 160Min + 140SMS (3d)", price: 600, recipientType: "TELEFONE" },
  { id: "a-p-4", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Afrinet 1GB (3d)", price: 700, recipientType: "TELEFONE" },
  { id: "a-p-5", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Afrinet 3GB (24h)", price: 800, recipientType: "TELEFONE" },
  { id: "a-p-6", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Fala com Todos 90Min + 90SMS (7d)", price: 500, recipientType: "TELEFONE" },
  { id: "a-p-7", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Afrinet 3GB (7d)", price: 1000, recipientType: "TELEFONE" },
  { id: "a-p-8", operator: "AFRICELL", category: "Promoção Afrimoney", name: "Afrimoney Promo 10GB (7d)", price: 3000, recipientType: "TELEFONE" },

  // Socializa
  { id: "a-s-1", operator: "AFRICELL", category: "Socializa", name: "Socializa 500MB (24h)", price: 200, recipientType: "TELEFONE" },
  { id: "a-s-2", operator: "AFRICELL", category: "Socializa", name: "Socializa 1GB (3d)", price: 400, recipientType: "TELEFONE" },
  { id: "a-s-3", operator: "AFRICELL", category: "Socializa", name: "Socializa 1.5GB (7d)", price: 500, recipientType: "TELEFONE" },
  { id: "a-s-4", operator: "AFRICELL", category: "Socializa", name: "Socializa 2GB (7d)", price: 750, recipientType: "TELEFONE" },
  { id: "a-s-5", operator: "AFRICELL", category: "Socializa", name: "Socializa 4GB (30d)", price: 1500, recipientType: "TELEFONE" },

  // 4G Unlimited
  { id: "a-u-1", operator: "AFRICELL", category: "4G Unlimited", name: "4G Bundles 0.5 mbps", price: 12000, recipientType: "TELEFONE", editablePrice: true },
  { id: "a-u-2", operator: "AFRICELL", category: "4G Unlimited", name: "4G Bundles 5 mbps", price: 25000, recipientType: "TELEFONE", editablePrice: true },

  // ================= ZAP SATÉLITE =================
  { id: "z-1", operator: "ZAP", category: "ZAP Satélite", name: "01 - ZAP Mini (7 dias)", price: 2000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-2", operator: "ZAP", category: "ZAP Satélite", name: "02 - ZAP Mini (14 dias)", price: 3500, recipientType: "CARTAO", editablePrice: true },
  { id: "z-3", operator: "ZAP", category: "ZAP Satélite", name: "03 - ZAP Mini (30 dias)", price: 5500, recipientType: "CARTAO", editablePrice: true },
  { id: "z-4", operator: "ZAP", category: "ZAP Satélite", name: "04 - ZAP Mais (7 dias)", price: 4000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-5", operator: "ZAP", category: "ZAP Satélite", name: "05 - ZAP Mais (14 dias)", price: 7000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-6", operator: "ZAP", category: "ZAP Satélite", name: "06 - ZAP Mais (30 dias)", price: 11000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-7", operator: "ZAP", category: "ZAP Satélite", name: "07 - ZAP Max (7 dias)", price: 6500, recipientType: "CARTAO", editablePrice: true },
  { id: "z-8", operator: "ZAP", category: "ZAP Satélite", name: "08 - ZAP Max (14 dias)", price: 11500, recipientType: "CARTAO", editablePrice: true },
  { id: "z-9", operator: "ZAP", category: "ZAP Satélite", name: "09 - ZAP Max (30 dias)", price: 18000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-10", operator: "ZAP", category: "ZAP Satélite", name: "10 - ZAP Premium (14 dias)", price: 16000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-11", operator: "ZAP", category: "ZAP Satélite", name: "11 - ZAP Premium (30 dias)", price: 26000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-12", operator: "ZAP", category: "ZAP Satélite", name: "12 - ZAP Plus (14 dias)", price: 8000, recipientType: "CARTAO", editablePrice: true },
  { id: "z-13", operator: "ZAP", category: "ZAP Satélite", name: "13 - ZAP Plus (30 dias)", price: 14000, recipientType: "CARTAO", editablePrice: true },

  // ================= DSTV =================
  { id: "d-1", operator: "DSTV", category: "DStv", name: "001 - DSTV Facil 7D", price: 2000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-2", operator: "DSTV", category: "DStv", name: "011 - DStv Familia 7D", price: 3000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-3", operator: "DSTV", category: "DStv", name: "012 - DStv Familia Mais 7D", price: 4000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-4", operator: "DSTV", category: "DStv", name: "013 - DStv Grande 7D", price: 6000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-5", operator: "DSTV", category: "DStv", name: "014 - DSTV Fácil (30D)", price: 4500, recipientType: "CARTAO", editablePrice: true },
  { id: "d-6", operator: "DSTV", category: "DStv", name: "02 - DSTV Família", price: 7500, recipientType: "CARTAO", editablePrice: true },
  { id: "d-7", operator: "DSTV", category: "DStv", name: "03 - DSTV Familia +", price: 11000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-8", operator: "DSTV", category: "DStv", name: "04 - DSTV Grande", price: 16500, recipientType: "CARTAO", editablePrice: true },
  { id: "d-9", operator: "DSTV", category: "DStv", name: "05 - DSTV Grande +", price: 24000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-10", operator: "DSTV", category: "DStv", name: "06 - DSTV Bué", price: 32000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-11", operator: "DSTV", category: "DStv", name: "07 - DSTV Premium", price: 38000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-12", operator: "DSTV", category: "DStv", name: "08 - DSTV Mega", price: 45000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-13", operator: "DSTV", category: "DStv", name: "09 - DSTV French Touch", price: 15000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-14", operator: "DSTV", category: "DStv", name: "10 - DSTV French Plus", price: 25000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-15", operator: "DSTV", category: "DStv", name: "11 - DSTV Grande Muralha da China", price: 20000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-16", operator: "DSTV", category: "DStv", name: "12 - DSTV ExtraView", price: 4000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-17", operator: "DSTV", category: "DStv", name: "13 - DSTV Indian", price: 18000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-18", operator: "DSTV", category: "DStv", name: "14 - DSTV HD-PVR", price: 5000, recipientType: "CARTAO", editablePrice: true },
  { id: "d-19", operator: "DSTV", category: "DStv", name: "15 - DSTV BoxOffice", price: 3000, recipientType: "CARTAO", editablePrice: true },
];
