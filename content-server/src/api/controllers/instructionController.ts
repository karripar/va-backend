import {Request, Response, NextFunction} from 'express';
import {
  InstructionLink,
  InstructionVisibility,
} from '../models/instructionModel';
import CustomError from '../../classes/CustomError';

/**
 * @module controllers/instructionController
 * @description Controller functions for handling instruction links and visibility settings,
 * including fetching, updating links, and toggling step visibility for admin users.
 */

const uploadServerUrl =
  process.env.PUBLIC_UPLOADS_URL || 'http://localhost:3003/uploads';

interface AuthRequest extends Request {
  user?: {
    id: string;
    user_level_id: number;
  };
}

/**
 * @function getInstructionLinks
 * @description Retrieves all instruction links from the database, sorted by stepIndex.
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
 * @description Updates an existing instruction link by ID. Only accessible to admin users.
 * Allows updating href of the link/document.
 *
 * @param {AuthRequest} req - Express request object containing linkId in params and href, isExternal, isFile in body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the link is successfully updated.
 * - 400: If href is not provided.
 * - 403: If the user is not an admin.
 * - 404: If the link does not exist.
 * - 500: On server errors.
 *
 * @example
 * // PUT /api/v1/instructions/links/:linkId
 * // Body: { href: "/new-path", isExternal: false, isFile: false }
 * updateInstructionLink(req, res, next);
 */
const updateInstructionLink = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // check if user is admin
    if (![2, 3].includes(res.locals.user.user_level_id)) {
      next(new CustomError('Unauthorized: Only admins can update links', 403));
      return;
    }

    const {linkId} = req.params;
    const {href, isExternal, isFile} = req.body;

    // validate input
    if (!href) {
      next(new CustomError('Href is required', 400));
      return;
    }

    const updatedLink = await InstructionLink.findByIdAndUpdate(
      linkId,
      {
        href,
        isExternal: isExternal ?? true,
        isFile: isFile ?? false,
      },
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
 * @description Retrieves visibility settings for all instruction steps.
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
 * @description Toggles the visibility of a specific instruction step by stepIndex.
 * Only accessible to admin users. If the step doesn't exist, creates it with isVisible=false.
 *
 * @param {AuthRequest} req - Express request object containing stepIndex in params.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When visibility is successfully toggled.
 * - 400: If stepIndex is invalid.
 * - 403: If the user is not an admin.
 * - 500: On server errors.
 *
 * @example
 * // PUT /api/v1/instructions/visibility/:stepIndex
 * toggleInstructionVisibility(req, res, next);
 */
const toggleInstructionVisibility = async (
  req: AuthRequest,
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

export {
  getInstructionLinks,
  updateInstructionLink,
  getInstructionVisibility,
  toggleInstructionVisibility,
};
