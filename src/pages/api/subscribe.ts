import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stipe";

export default async function subscribe (req: NextApiRequest, response: NextApiResponse){
    if(req.method === 'POST'){

        const session = await getSession({req})

        const stripeCustomer = await stripe.customers.create({
            email: session.user.email
        })

        const stripeChecoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.id,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {price: 'price_1Jv1knBpFNN52xR2bE6xfOjq', quantity: 1}
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        return response.status(200).json({sessionId: stripeChecoutSession.id})

    } else {
        response.setHeader('Allow', 'Post')
        response.status(405).end('Method not Allowed')
    }
}
