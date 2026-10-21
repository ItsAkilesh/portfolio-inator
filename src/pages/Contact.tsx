/**
 * File: Contact.tsx
 * Purpose: Contact page: header band (portrait shown when contactSection.showProfileImage is true)
 *          and the contact panel.
 * Author: Akilesh
 * Date: 2026-10-20 (updated 2026-10-21)
 */
import { PageBand } from "../components/layout/PageBand";
import { contactPageData, greeting } from "../portfolio";
import { ContactPanel } from "../sections/ContactPanel";

export default function Contact() {
  const { contactSection } = contactPageData;
  const image = contactSection.showProfileImage
    ? {
        src: contactSection.profile_image_path,
        alt: `Portrait of ${greeting.title}`,
      }
    : undefined;
  return (
    <div className="page">
      <PageBand
        title={contactSection.title}
        description={contactSection.description}
        image={image}
      />
      <ContactPanel />
    </div>
  );
}
