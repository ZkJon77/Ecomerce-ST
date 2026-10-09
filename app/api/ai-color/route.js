import { NextResponse } from 'next/server';
import { COLOR_MAP, CAR_MODELS } from '@/lib/constants/colors';

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'No message provided' }, { status: 400 });

    const term = message.toLowerCase();
    let foundCode = null;
    let explanation = "Desculpe, não consegui encontrar a cor exata com base nas informações fornecidas. Tente ser mais específico, como 'Honda Civic Prata 2014'.";

    // 1. Tentar encontrar por modelo/marca/ano (Pattern Matching)
    for (const car of CAR_MODELS) {
      const brandMatch = term.includes(car.brand.toLowerCase());
      const modelMatch = term.includes(car.model.toLowerCase());

      if (brandMatch && modelMatch) {
        // Tentar encontrar o ano
        const years = Object.keys(car.years);
        const matchingYear = years.find(yearRange => {
          // Extrair ano do termo (ex: "2014")
          const yearMatch = term.match(/\b(19|20)\d{2}\b/);
          if (!yearMatch) return false;

          const userYear = parseInt(yearMatch[0]);
          const [start, end] = yearRange.split('-').map(Number);
          return userYear >= start && userYear <= end;
        });

        if (matchingYear) {
          foundCode = car.years[matchingYear];
          explanation = `Encontrei! Para o seu ${car.brand} ${car.model} do ano ${matchingYear}, a cor correta é ${COLOR_MAP[foundCode]?.name || 'esta cor'} (${foundCode}).`;
          break;
        }
      }
    }

    // 2. Tentar encontrar por nome da cor ou código
    if (!foundCode) {
      const colorMatch = Object.entries(COLOR_MAP).find(([code, data]) =>
        term.includes(data.name.toLowerCase()) || term.includes(code.toLowerCase())
      );
      if (colorMatch) {
        foundCode = colorMatch[0];
        explanation = `Localizei a cor ${COLOR_MAP[foundCode].name} (${foundCode}) com base na sua descrição.`;
      }
    }

    return NextResponse.json({
      code: foundCode,
      explanation: explanation
    });
  } catch (error) {
    console.error('AI Color Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}