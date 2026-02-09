import { Router, Request, Response } from 'express';
import { formService } from '../services/form.service';

const router = Router();

// POST /api/forms - Create new form submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const formData = req.body;
    console.log('📝 Creating form submission:', formData);
    
    const submission = await formService.createFormSubmission(formData);
    
    res.status(201).json({
      success: true,
      data: submission,
      message: 'Form submitted successfully'
    });
  } catch (error) {
    console.error('❌ Error creating form submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
    res.status(500).json({ error: errorMessage });
  }
});

// GET /api/forms - Get all form submissions
router.get('/', async (req: Request, res: Response) => {
  try {
    const submissions = await formService.getAllFormSubmissions();
    
    res.json({
      success: true,
      data: submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('❌ Error fetching form submissions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch submissions';
    res.status(500).json({ error: errorMessage });
  }
});

// GET /api/forms/:id - Get specific form submission
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const submission = await formService.getFormSubmission(id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Form submission not found' });
    }
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('❌ Error fetching form submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch submission';
    res.status(500).json({ error: errorMessage });
  }
});

// PUT /api/forms/:id - Update form submission
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const formData = req.body;
    
    const submission = await formService.updateFormSubmission(id, formData);
    
    if (!submission) {
      return res.status(404).json({ error: 'Form submission not found' });
    }
    
    res.json({
      success: true,
      data: submission,
      message: 'Form updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating form submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update submission';
    res.status(500).json({ error: errorMessage });
  }
});

// DELETE /api/forms/:id - Delete form submission
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await formService.deleteFormSubmission(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Form submission not found' });
    }
    
    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting form submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete submission';
    res.status(500).json({ error: errorMessage });
  }
});

export { router as formRoutes };
