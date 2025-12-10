import {Request, Response, NextFunction} from 'express';
import {
  InstructionLink,
  InstructionVisibility,
  InstructionStep,
} from '../models/instructionModel';
import CustomError from '../../classes/CustomError';

/**
 * @module controllers/instructionController
 * @remarks Controller functions for handling instruction links and visibility settings,
 * including fetching, updating links, and toggling step visibility for admin users.
 */

console.log(process.env.PUBLIC_UPLOADS_URL);

const uploadServerUrl = process.env.PUBLIC_UPLOADS_URL || 'http://localhost:3003/uploads';

/**
 * @function getInstructionLinks
 * @remarks Retrieves all instruction links from the database, sorted by stepIndex.
 * If no links exist, initializes the database with default bilingual links for all 9 steps.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object returning an array of instruction links.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Array of instruction links with labelFi, labelEn, href, isExternal, isFile, and stepIndex.
 * - 500: If fetching fails.
 *
 * @example
 * // GET /api/v1/instructions/links
 * getInstructionLinks(req, res, next);
 */
const getInstructionLinks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let links = await InstructionLink.find().sort({stepIndex: 1});

    // initialize default links if none exist
    if (links.length === 0) {
      const defaultLinks = [
        // step 0
        {
          stepIndex: 0,
          labelFi: 'Vaihtokohteet',
          labelEn: 'Destinations',
          href: '/destinations',
          isExternal: false,
          isFile: false,
        },
        {
          stepIndex: 0,
          labelFi: 'Kokemukset ja vinkit',
          labelEn: 'Tips & experiences',
          href: '/tips',
          isExternal: false,
          isFile: false,
        },
        {
          stepIndex: 0,
          labelFi: 'Raporttiportaali',
          labelEn: 'Exchange Reports',
          href: 'https://www.service4mobility.com/europe/MobilitySearchServlet?identifier=HELSINK41&kz_bew_pers=S&kz_bew_art=OUT&sprache=en',
          isExternal: true,
          isFile: false,
        },
        // step 1
        {
          stepIndex: 1,
          labelFi: 'Oma portaali',
          labelEn: 'Student Portal',
          href: 'https://opiskelija.oma.metropolia.fi/group/pakki/kv-etusivu',
          isExternal: true,
          isFile: false,
        },
        // step 2
        {
          stepIndex: 2,
          labelFi: 'Säännöt ja periaatteet',
          labelEn: 'Rules and Principles',
          href: `${uploadServerUrl}/saannotjaperiaatteet_1762801709026.pdf`,
          isExternal: true,
          isFile: true,
        },
        {
          stepIndex: 2,
          labelFi: 'Ota yhteyttä',
          labelEn: 'Contact',
          href: '/contact',
          isExternal: false,
          isFile: false,
        },
        // step 3
        {
          stepIndex: 3,
          labelFi: 'Mobility Online',
          labelEn: 'Mobility Online',
          href: 'https://www.service4mobility.com/europe/LoginServlet?org_id=28&sprache=en&loginType=S&identifier=HELSINK41',
          isExternal: true,
          isFile: false,
        },
        // step 4
        {
          stepIndex: 4,
          labelFi: 'Mobility Online',
          labelEn: 'Mobility Online',
          href: 'https://www.service4mobility.com/europe/LoginServlet?org_id=28&sprache=en&loginType=S&identifier=HELSINK41',
          isExternal: true,
          isFile: false,
        },
        // step 5
        {
          stepIndex: 5,
          labelFi: 'Learning agreement',
          labelEn: 'Learning agreement',
          href: `${uploadServerUrl}/Learning Agreement instructions (11)_1762783848601.pdf`,
          isExternal: true,
          isFile: true,
        },
        // step 6
        {
          stepIndex: 6,
          labelFi: 'Opintosuoritusote',
          labelEn: 'Transcript',
          href: 'https://opiskelija.oma.metropolia.fi/group/pakki/opintosuoritukset',
          isExternal: true,
          isFile: false,
        },
        {
          stepIndex: 6,
          labelFi: 'Vakuutustodistus',
          labelEn: 'Insurance Certificate',
          href: `${uploadServerUrl}/Insurance_information_in_english_protector_2020_PÃ¤ivitetty 15.2.2025 (6)_1762801630903.ppt`,
          isExternal: false,
          isFile: true,
        },
        {
          stepIndex: 6,
          labelFi: 'Kielitodistus pohja',
          labelEn: 'Language Certificate',
          href: `${uploadServerUrl}/Language_certificate_template (11)_1762801647586.pdf`,
          isExternal: true,
          isFile: true,
        },
        {
          stepIndex: 6,
          labelFi: 'OLS-kielitesti',
          labelEn: 'OLS Language Test',
          href: 'https://academy.europa.eu/local/euacademy/pages/course/community-overview.php',
          isExternal: true,
          isFile: false,
        },
        // step 7
        {
          stepIndex: 7,
          labelFi: 'Ota yhteyttä',
          labelEn: 'Contact',
          href: '/contact',
          isExternal: false,
          isFile: false,
        },
        // step 8
        {
          stepIndex: 8,
          labelFi: 'Apurahat ja kustannukset',
          labelEn: 'Grants and Costs',
          href: '/grants',
          isExternal: false,
          isFile: false,
        },
        {
          stepIndex: 8,
          labelFi: 'Muuttoilmoitus',
          labelEn: 'Change of Address',
          href: 'https://www.posti.fi/muuttaminen/muuttoilmoitus',
          isExternal: true,
          isFile: false,
        },
        {
          stepIndex: 8,
          labelFi: 'Matkustusilmoitus',
          labelEn: 'Travel Notification',
          href: 'https://um.fi/matka-ilmoitus',
          isExternal: true,
          isFile: false,
        },
      ];

      for (const linkData of defaultLinks) {
        const link = new InstructionLink(linkData);
        await link.save();
      }
      links = await InstructionLink.find().sort({stepIndex: 1});
    }

    res.json(links);
  } catch (error) {
    console.error('Error fetching instruction links:', error);
    next(new CustomError('Failed to fetch instruction links', 500));
  }
};

/**
 * @function updateInstructionLink
 * @remarks
 * Updates an existing instruction link by ID. Accessible to authorized admin users
 * (`user_level_id` 2 or 3). The endpoint accepts a new `href`
 * and will set it as an internal path, an external URL, or an uploaded file.
 * If the provided `href` begins with the configured `PUBLIC_UPLOADS_URL`, it is
 * treated as an uploaded file and `isFile` will be set to `true`.
 *
 * @param {AuthRequest} req - Express request object containing linkId in params and href, isExternal, isFile in body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the link is successfully updated.
 * - 400: If `href` is missing or invalid (includes JS/data URIs or invalid URL).
 * - 401: If the request is unauthenticated (missing/invalid token).
 * - 403: If authenticated but the user does not have admin/superadmin privileges.
 * - 404: If the link does not exist.
 * - 500: On server errors.
 *
 * @example
 * // PUT /api/v1/instructions/links/:linkId
 * // Body: { href: "/new-path", isExternal: false, isFile: false }
 * updateInstructionLink(req, res, next);
 */

const updateInstructionLink = async (
  req: Request<{linkId: string}, {}, {href: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // admin check
    if (!res.locals.user || ![2, 3].includes(res.locals.user.user_level_id)) {
      next(new CustomError('Unauthorized: Only admins can update links', 403));
      return;
    }

    const {linkId} = req.params;
    let {href} = req.body;

    if (typeof href !== 'string' || href.trim() === '') {
      next(new CustomError('Href is required', 400));
      return;
    }

    href = href.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    const lowerHref = href.toLowerCase();

    // validation to disallow javascript: and data:
    if (lowerHref.startsWith('javascript:') || lowerHref.startsWith('data:')) {
      return next(new CustomError('Invalid href', 400));
    }

    // accept internal paths or http(s) URLs or upload server URLs
    let isExternal = true;
    let isFile = false;

    if (href.startsWith('/')) {
      isExternal = false;
      isFile = false;
    } else if (href.startsWith(uploadServerUrl)) {
      // uploaded files hosted on upload-server
      isExternal = false;
      isFile = true;
    } else {
      try {
        const u = new URL(href);
        if (!['http:', 'https:'].includes(u.protocol)) {
          return next(new CustomError('Invalid protocol', 400));
        }
      } catch {
        return next(new CustomError('Invalid URL', 400));
      }
    }

    const updates: {
      href: string;
      isExternal: boolean;
      isFile: boolean;
    } = {
      href: href,
      isExternal,
      isFile,
    };

    const updatedLink = await InstructionLink.findByIdAndUpdate(
      linkId,
      {$set: updates},
      {new: true},
    );

    if (!updatedLink) {
      next(new CustomError('Link not found', 404));
      return;
    }

    res.json({
      message: 'Link updated successfully',
      link: updatedLink,
    });
  } catch (error) {
    console.error('Error updating instruction link:', error);
    next(new CustomError('Failed to update instruction link', 500));
  }
};

/**
 * @function getInstructionVisibility
 * @remarks Retrieves visibility settings for all instruction steps.
 * If no settings exist, initializes the database with default visibility (all steps visible) for 9 steps.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object returning an array of visibility settings.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Array of visibility objects with stepIndex and isVisible properties.
 * - 500: If fetching fails.
 *
 * @example
 * // GET /api/v1/instructions/visibility
 * getInstructionVisibility(req, res, next);
 */
const getInstructionVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let visibility = await InstructionVisibility.find().sort({stepIndex: 1});

    // Initialize with default records if none exist
    if (visibility.length === 0) {
      const defaultVisibility = [];
      for (let i = 0; i < 9; i++) {
        const record = new InstructionVisibility({
          stepIndex: i,
          isVisible: true,
        });
        await record.save();
        defaultVisibility.push(record);
      }
      visibility = defaultVisibility;
    }

    res.json(visibility);
  } catch (error) {
    console.error('Error fetching instruction visibility:', error);
    next(new CustomError('Failed to fetch instruction visibility', 500));
  }
};

/**
 * @function toggleInstructionVisibility
 * @remarks
 * Toggles the visibility of a specific instruction step by `stepIndex`.
 * Accessible to authorized admin users (`user_level_id` 2 or 3).
 * If the step doesn't exist, a new record is created with `isVisible=false` and
 * then toggled.
 *
 * @param {AuthRequest} req - Express request object containing stepIndex in params.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When visibility is successfully toggled.
 * - 400: If `stepIndex` is invalid.
 * - 401: If the request is unauthenticated (missing/invalid token).
 * - 403: If authenticated but the user does not have admin privileges.
 * - 500: On server errors.
 *
 * @example
 * // PUT /api/v1/instructions/visibility/:stepIndex
 * toggleInstructionVisibility(req, res, next);
 */
const toggleInstructionVisibility = async (
  req: Request<{stepIndex: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // check if user is admin
    if (![2, 3].includes(res.locals.user.user_level_id)) {
      next(
        new CustomError('Unauthorized: Only admins can toggle visibility', 403),
      );
      return;
    }
    const {stepIndex} = req.params as {stepIndex: string};
    const index = parseInt(stepIndex, 10);

    if (isNaN(index) || index < 0) {
      next(new CustomError('Invalid step index', 400));
      return;
    }

    let visibility = await InstructionVisibility.findOne({stepIndex: index});

    if (!visibility) {
      visibility = new InstructionVisibility({
        stepIndex: index,
        isVisible: false,
      });
    } else {
      visibility.isVisible = !visibility.isVisible;
    }

    await visibility.save();
    res.json({
      message: `Step ${index} visibility toggled`,
      visibility,
    });
  } catch (error) {
    console.error('Error toggling instruction visibility:', error);
    next(new CustomError('Failed to toggle instruction visibility', 500));
  }
};

/**
 * @function getInstructionSteps
 * @remarks Retrieves all instruction steps from the database, sorted by stepIndex.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 * @returns {Promise<void>} Responds with:
 * - 200: Array of instruction steps.
 * - 500: If fetching fails.
 *
 * @example
 * // GET /api/v1/instructions/steps
 * getInstructionSteps(req, res, next);
 */

const getInstructionSteps = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let steps = await InstructionStep.find().sort({stepIndex: 1});

    // Initialisoi steppien sisältö, jos puuttuu
    if (steps.length === 0) {
      const defaultSteps = [
        {
          stepIndex: 0,
          titleFi: 'Etsi tietoa',
          titleEn: 'Find information',
          textFi:
            'Tutustu tutkintoosi soveltuviin vaihtokohteisiin ja kohdekoulujen kurssitarjontaan.\n\nLue aiempien vaihto-opiskelijoiden kokemuksia ja vinkkejä raporttiportaalista.',
          textEn:
            'Explore partner universities and course offerings relevant to your degree.\n\nRead previous students experiences and tips from the Exchange Report portal.',
        },
        {
          stepIndex: 1,
          titleFi: 'Hakuinfo',
          titleEn: 'Application info',
          textFi:
            'Osallistu hakuaikoina järjestettäviin alakohtaisiin infotilaisuuksiin kampuksella tai verkossa.\n\nTarkat hakuaikojen ja infotilaisuuksien päivämäärät näet opiskelijan omasta portaalista.',
          textEn:
            'Attend field-specific info sessions during the application period on campus or online.\n\nExact dates are available in student portal.',
        },
        {
          stepIndex: 2,
          titleFi: 'Ennen hakua',
          titleEn: 'Before you apply',
          textFi:
            'Lue huolellisesti yksityiskohtaiset vaihdon säännöt ja periaatteet.\n\nVoit halutessasi keskustella oman tutkinto-ohjelmasi yhteyshenkilön kanssa milloin vaihtoon kannattaa lähteä ja millaiset opinnot sopivat tutkintoosi.',
          textEn:
            'Read the exchange rules and guidelines carefully.\n\nYou can discuss with your degree programme contact person about the best timing for your exchange and suitable courses.',
        },
        {
          stepIndex: 3,
          titleFi: 'Metropolian sisäinen haku',
          titleEn: "Metropolia's internal application",
          textFi:
            'Vaihtoon hakeminen tapahtuu kahdessa osassa. Hakemus Metropolian sisäisessä haussa täytetään Mobility Onlinessa hakuaikana.\n\nHakemukseen riittää, että olet löytänyt sinulle sopivat vaihtokohteet ja laatinut suunnitelmaa vaihdon sisällöstä ja tavoitteista.',
          textEn:
            'Applying for an exchange takes place in two parts. The internal application is filled in Mobility Online during the application period.\n\nTo apply, you need to find exchange destinations that suit you and describe your exchange study content and goals.',
        },
        {
          stepIndex: 4,
          titleFi: 'Sisäisen haun tulokset',
          titleEn: 'Internal selection results',
          textFi:
            'Hakuajan päätyttyä sinulle ilmoitetaan sisäisen haun tulokset. Mikäli vaihtosuunnitelmasi hyväksytään, käy vahvistamassa vaihtopaikka Mobility Onlinessa 7 päivän kuluessa.\n\nVaihtopaikan vahvistamisen jälkeen voit aloittaa varsinaisen hakuprosessin kohdekouluun.',
          textEn:
            'After the internal selection you will be informed of the results. If your exchange plan is approved, confirm your place in Mobility Online within 7 days.\n\nOnce confirmed, you can start the official application to the host university.',
        },
        {
          stepIndex: 5,
          titleFi: 'Hae kohdekorkeakouluun',
          titleEn: 'Apply to the host university',
          textFi:
            'Aloita hakemuksen täyttäminen ja tarvittavien liitteiden hankkiminen hyvissä ajoin. Vaihto on ehdollinen kohdekoulun hyväksyntään saakka.\n\nLaadi Mobility Onlinessa Learning Agreement eli vaihdon opintosuunnitelma.',
          textEn:
            'Start preparing your application and required attachments well in advance. The exchange is conditional until the host university accepts you.\n\nPrepare the Learning Agreement in Mobility Online.',
        },
        {
          stepIndex: 6,
          titleFi: 'Hakemuksen täyttäminen',
          titleEn: 'Filling attachments',
          textFi:
            'Sisällytä hakemukseen tarvittavat liitteet, esim. opintosuoritusote, vakuutustodistus, kielitodistus, CV ja motivaatiokirje.\n\nJos kohdekoulu vaatii kielitodistuksen, voit tehdä OLS-kielitestin tai pyytää opettajaa täyttämään kielitodistus pohjan.',
          textEn:
            'Include necessary attachments such as transcript of records, insurance certificate, language certificate, CV and motivation letter.\n\nIf a language certificate is required, you can take the OLS test or ask a language teacher to fill in the language certificate template.',
        },
        {
          stepIndex: 7,
          titleFi: 'Hakemuksen lähettäminen ja hyväksyntä',
          titleEn: 'Submitting application & acceptance',
          textFi:
            'Osallistu pakollisiin vaihto-orientaatioihin, joista saat täsmätietoa hakemuksen täyttämiseen ja lähdön valmisteluun.\n\nKun saat kohdekoulun hyväksymiskirjeen, välitä hyväksymistieto kv-asiantuntijallesi.',
          textEn:
            'Attend mandatory exchange orientation sessions which provide guidance on applying and preparing to depart.\n\nWhen you receive the acceptance letter from the host university, forward it to the international affairs contact.',
        },
        {
          stepIndex: 8,
          titleFi: 'Valmistaudu lähtöön',
          titleEn: 'Prepare for departure',
          textFi:
            'Hae apurahaa ennen vaihdon alkamista. Apurahan käsittelyn edellytyksenä on hyväksytty Learning Agreement ja kohdekoulun vahvistus.\n\nHae tarvittaessa viisumi tai oleskelulupa ja varaa matkat.',
          textEn:
            'Apply for grants before your exchange starts. A grant requires an approved Learning Agreement and confirmation from the host university.\n\nApply for a visa or residence permit if needed and book travel.',
        },
      ];
      for (const stepData of defaultSteps) {
        const step = new InstructionStep(stepData);
        await step.save();
      }
      steps = await InstructionStep.find().sort({stepIndex: 1});
    }
    res.json(steps);
  } catch (error) {
    console.error('Error fetching instruction steps:', error);
    next(new CustomError('Failed to fetch instruction steps', 500));
  }
};

/**
 * @function updateInstructionStep
 * @remarks
 * Updates an existing instruction step by `stepIndex`. Accessible to authorized
 * admin users (`user_level_id` 2 or 3). Allows updating
 * `titleFi`, `titleEn`, `textFi` and `textEn` fields.
 *
 * @param {AuthRequest} req - Express request object containing stepIndex in params and titleFi, titleEn, textFi, textEn in body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the step is successfully updated.
 * - 401: If the request is unauthenticated (missing/invalid token).
 * - 403: If authenticated but the user does not have admin privileges.
 * - 404: If the step does not exist.
 * - 500: On server errors.
 */

const updateInstructionStep = async (
  req: Request<{stepIndex: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      next(new CustomError('Unauthorized: User not found', 401));
      return;
    }
    // admin check
    if (![2, 3].includes(user.user_level_id)) {
      next(new CustomError('Unauthorized: Only admins can update steps', 403));
      return;
    }
    // validate stepIndex
    const {stepIndex} = req.params;
    const index = Number(stepIndex);
    if (Number.isNaN(index) || index < 0) {
      next(new CustomError('Invalid step index', 400));
      return;
    }

    const {titleFi, titleEn, textFi, textEn} = req.body;

    const updates: Record<string, string> = {};
    if (titleFi) updates.titleFi = titleFi;
    if (titleEn) updates.titleEn = titleEn;
    if (textFi) updates.textFi = textFi;
    if (textEn) updates.textEn = textEn;

    if (Object.keys(updates).length === 0) {
      next(new CustomError('No valid fields to update', 400));
      return;
    }

    const updatedStep = await InstructionStep.findOneAndUpdate(
      {stepIndex: index},
      {$set: updates},
      {new: true, runValidators: true},
    );

    if (!updatedStep) {
      next(new CustomError('Step not found', 404));
      return;
    }
    res.json({message: 'Step updated', step: updatedStep});
  } catch (error) {
    console.error('Error updating instruction step:', error);
    next(new CustomError('Failed to update instruction step', 500));
  }
};

export {
  getInstructionLinks,
  updateInstructionLink,
  getInstructionVisibility,
  toggleInstructionVisibility,
  getInstructionSteps,
  updateInstructionStep,
};
