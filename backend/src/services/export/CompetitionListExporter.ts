import { Fancier, Pigeon, Race, Result } from "@prisma/client";
import puppeteer from "puppeteer";

type ResultWithRelations = Result & {
  race: Race;
  pigeon: Pigeon;
  fancier: Fancier;
};

export interface CompetitionListData {
  raceId: number;
  raceName: string;
  releaseDate: string;
  totalPigeons: number;
  results: Array<{
    position: number;
    ringNumber: string;
    fancierName: string;
    arrivalTime: string;
    speed: number;
    coefficient: number;
  }>;
}

export class CompetitionListExporter {
  static generateCSV(data: CompetitionListData): string {
    const headers = [
      'Pozycja',
      'Numer obrączki',
      'Hodowca',
      'Czas przylotu',
      'Prędkość (m/min)',
      'Współczynnik',
    ];

    const rows = data.results.map(result => [
      result.position.toString(),
      result.ringNumber,
      result.fancierName,
      result.arrivalTime,
      result.speed.toFixed(2),
      result.coefficient.toFixed(4),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private static _generateHTMLForPDF(data: CompetitionListData): string {
    // Helper method to generate the HTML content for the PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lista konkursowa - ${data.raceName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          .race-info { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Lista konkursowa</h1>
          <div class="race-info">
            <p><strong>Wyścig:</strong> ${data.raceName}</p>
            <p><strong>Data wypuszczenia:</strong> ${data.releaseDate}</p>
            <p><strong>Liczba gołębi:</strong> ${data.totalPigeons}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Pozycja</th>
              <th>Numer obrączki</th>
              <th>Hodowca</th>
              <th>Czas przylotu</th>
              <th>Prędkość (m/min)</th>
              <th>Współczynnik</th>
            </tr>
          </thead>
          <tbody>
            ${data.results.map(result => `
              <tr>
                <td>${result.position}</td>
                <td>${result.ringNumber}</td>
                <td>${result.fancierName}</td>
                <td>${result.arrivalTime}</td>
                <td>${result.speed.toFixed(2)}</td>
                <td>${result.coefficient.toFixed(4)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    return html;
  }

  static async generatePDF(data: CompetitionListData): Promise<Buffer> {
    // Launch a headless browser
    const browser = await puppeteer.launch({
      // Important for running in Docker/CI environments
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Generate HTML content
    const htmlContent = this._generateHTMLForPDF(data);
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF from the page content
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
  static async exportFromResults(results: ResultWithRelations[]): Promise<CompetitionListData | null> {
    if (results.length === 0) {
      return null;
    }
    const firstResult = results[0];

    return {
      raceId: firstResult.race.id,
      raceName: firstResult.race.name ?? 'Unknown Race',
      releaseDate: firstResult.race.releaseDatetimeUtc?.toISOString().split('T')[0] ?? 'N/A',
      totalPigeons: results.length,
      results: results.map((result) => ({
        position: result.position ?? 0,
        ringNumber: result.pigeon.ringNumber,
        fancierName: result.fancier.name ?? 'Unknown Fancier',
        arrivalTime: result.arrivalDatetimeUtc?.toISOString() ?? '',
        speed: Number(result.speedMPerMin) || 0,
        coefficient: Number(result.coefficient) || 0,
      })),
    };
  }
}