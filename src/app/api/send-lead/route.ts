import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, calculation, result, type, topic, note } = body;

    // Validate inputs
    if (!contact?.name || !contact?.email) {
      return NextResponse.json({ error: 'Missing contact info' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY || 're_CRpDNTGp_F8VyYSvEnW6RiSxh1Z123MMd';
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing');
      return NextResponse.json({ error: 'Server misconfiguration (Missing API Key)' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const isMortgage = type === 'mortgage';
    const subject = isMortgage
      ? `Hypo Poptávka: ${contact.name} (${calculation?.location})`
      : `Poptávka Pojištění: ${contact.name} (${topic})`;

    // Format Email HTML
    let emailHtml = '';

    if (isMortgage) {
      emailHtml = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Nová Hypo Poptávka</h2>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0;">Kontaktní údaje</h3>
                  <p><strong>Jméno:</strong> ${contact.name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
                  <p><strong>Telefon:</strong> <a href="tel:${contact.phone}">${contact.phone || 'Neuveden'}</a></p>
                  <p><strong>Chci nabídky nemovitostí:</strong> 
                    <span style="font-weight: bold; color: ${contact.wantAgentOffers ? '#059669' : '#64748b'};">
                        ${contact.wantAgentOffers ? 'ANO ✅' : 'NE'}
                    </span>
                  </p>
                </div>

                <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
                  <h3 style="margin-top: 0;">Parametry Hypotéky</h3>
                  <ul style="line-height: 1.6;">
                    <li><strong>Lokalita:</strong> ${calculation.location} (${calculation.region})</li>
                    <li><strong>Nemovitost:</strong> ${calculation.propertyType}</li>
                    <li><strong>Plocha:</strong> ${calculation.areaSize} m²</li>
                    <li><strong>Příjem:</strong> ${calculation.income.toLocaleString()} Kč</li>
                    <li><strong>Hotovost:</strong> ${calculation.cash.toLocaleString()} Kč</li>
                  </ul>

                  <h3 style="margin-top: 20px; color: ${result.isSuccess ? '#059669' : '#d97706'};">
                    Výsledek kalkulace: ${result.isSuccess ? 'SCHVÁLENO' : 'ZAMÍTNUTO / K ŘEŠENÍ'}
                  </h3>
                  <p><strong>Max Hypotéka:</strong> ${result.maxLoan.toLocaleString()} Kč</p>
                  ${!result.isSuccess ? `<p><strong>Důvod:</strong> ${result.failReason || 'Neurčeno'}</p>` : ''}
                  ${result.maxAffordableM2 ? `<p><strong>Max dostupná plocha:</strong> ${result.maxAffordableM2} m²</p>` : ''}
                </div>
              </div>
            `;
    } else {
      // General / Insurance Lead
      emailHtml = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0284c7;">Nová Poptávka Pojištění</h2>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0;">Kontaktní údaje</h3>
                  <p><strong>Jméno:</strong> ${contact.name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
                  <p><strong>Telefon:</strong> <a href="tel:${contact.phone}">${contact.phone || 'Neuveden'}</a></p>
                </div>

                 <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
                    <h3 style="margin-top: 0;">Detaily Poptávky</h3>
                    <p style="font-size: 18px;"><strong>Téma:</strong> ${topic || 'Obecný dotaz'}</p>
                    ${note ? `<div style="margin-top: 10px; padding: 10px; background: #fffbeb; border-radius: 8px;"><strong>Poznámka:</strong><br/>${note}</div>` : ''}
                 </div>
              </div>
            `;
    }

    emailHtml += `
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
              Odesláno z aplikace Hypo Valašsko
            </p>
        `;

    // Fallback owner email from env or default
    const ownerEmail = process.env.OWNER_EMAIL || 'reich.tomas@gmail.com';

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [ownerEmail],
      subject: subject,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Email send failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
