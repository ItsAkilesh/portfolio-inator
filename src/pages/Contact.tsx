/**
 * File: Contact.tsx
 * Purpose: Contact page: header band with portrait and the contact panel.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { PageBand } from "../components/layout/PageBand";
import { contactPageData, greeting } from "../portfolio";
import { ContactPanel } from "../sections/ContactPanel";

export default function Contact() {
  const { contactSection } = contactPageData;
  return (
    <div className="page">
      <PageBand
        kicker={greeting.title}
        title={contactSection.title}
        description={contactSection.description}
        image={{
          src: contactSection.profile_image_path,
          alt: `Portrait of ${greeting.title}`,
        }}
      />
      <ContactPanel />
    </div>
  );
}
