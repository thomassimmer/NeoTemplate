'use client';

import { Link, Stack } from '@mui/material';
import { useModalContext } from '../../providers/modal-provider';

export default function PrivacyPolicy() {
  const { setShowContactModal } = useModalContext();

  return (
    <Stack
      sx={{
        textAlign: 'justify',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      maxWidth={'lg'}
      width={'100%'}
    >
      <h2>Privacy Policy</h2>

      <p>
        NeoTemplate.com (“NeoTemplate”, “we” or “us”) is committed to protecting
        your privacy. This Privacy Policy explains the methods and reasons we
        collect, use, disclose, transfer, and store your information. If you
        have any questions about the contents of this policy, don’t hesitate to
        contact us.
      </p>

      <p>
        If you do not consent to the collection and use of information from or
        about you in accordance with this Privacy Policy, then you are not
        permitted to use NeoTemplate or any services provided on&nbsp;
        <Link href='/' rel='noopener noreferrer' underline='hover'>
          https://neotemplate.com
        </Link>
        .
      </p>

      <h3>Applicable Law</h3>

      <p>
        NeoTemplate is headquartered in Paris, France. By viewing any content or
        otherwise using the services offered by NeoTemplate, you consent to the
        transfer of information to the European Union to the extent applicable,
        and the collection, storage, and processing of information under
        European Union law.
      </p>

      <h3>Information We Collect</h3>

      <p>
        Information you submit: We store information you provide on this site
        via forms, surveys, or any other interactive content. This information
        includes your email address and your uploaded profile picture.
      </p>

      <p>
        <strong>Log Files</strong>: We collect information when you use services
        provided on our site. This information may include your IP address,
        device and software characteristics (such as type and operating system),
        page views, referral URLs, device identifiers or other unique
        identifiers such as advertising identifiers (e.g., “ad-ID” or “IDFA”),
        and carrier information. Log files are primarily used for the purpose of
        enhancing the user experience.
      </p>

      <p>
        <strong>Cookies</strong>: We use cookies and related technologies only
        for authentication. Cookies are small text files created by a web
        server, delivered through a web browser, and stored on your computer.
        Most Internet browsers automatically accept cookies. You can instruct
        your browser, by changing its settings, to stop accepting cookies or to
        prompt you before accepting a cookie from the websites you visit. When
        you connect to NeoTemplate.com using your password, a cookie will be
        stored on your computer so you do not have to re-enter it repeatedly
        during that session.
      </p>

      <h3>Contact Us</h3>

      <p>
        At NeoTemplate, we believe our talented customer service staff will be
        able to resolve any issues you may have using our services. If you would
        like additional information about this privacy policy, please&nbsp;
        <Link
          underline='hover'
          href='#'
          onClick={(e) => {
            e.preventDefault();
            setShowContactModal(true);
          }}
          rel='noopener noreferrer'
        >
          contact us
        </Link>
        .
      </p>
    </Stack>
  );
}
