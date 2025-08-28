import { Router } from 'express';
import { getClaims, verifyAndGetClaims } from '../middleware/jwt';

const router = Router({ mergeParams: true });

router.get("/", verifyAndGetClaims, (req: any, res: any) => {
    const { team } = req.params;
    res.json({
        team,
        message: "Claims validated and extracted successfully",
        claims: req.claims,
        headers: req.headers
    });
});

router.get("/no-verify", getClaims, (req: any, res: any) => {
    const { team } = req.params;
    res.json({
        team,
        message: "Claims extracted successfully",
        claims: req.claims,
        headers: req.headers
    });
});

export default router;