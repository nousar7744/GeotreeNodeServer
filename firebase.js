import admin from "firebase-admin";


let FIREBASE_PROJECT_ID='geotreenew'
let FIREBASE_CLIENT_EMAIL='firebase-adminsdk-xxx@geotreenew.iam.gserviceaccount.com'
let FIREBASE_PRIVATE_KEY= "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoeToS6ctQQqsv\nUQYPJyArBjFLleMhLdkoxVQb5wvuGEywDwgx6VWz5LPPCECdHraDhpC6MUdK7DdD\nS+TjzmWCVAS8CWRB8sfH/byOqYaQf8c9i8N1bmOX236lbvlsK7q1jvtwUxX56omT\najzSsQy9NZ3FSdUmr39ECZ4Xmx2dVCHF7I+dn2pNpK8MVeIW2pD/VLG4D/rbmQCK\nXTpunTgOSd/APp1OzI2zUjr9lnDUBvXO+7FmhRkHbagKGP1fli+BsWM3wkhy6Fzx\neKYOAB9M8RXIf75G4UX3oHWcQ4ApU/1Dt//gLR5aUw4VjI9wBd0sCr4wNCmF9n7K\nFJyNpl7FAgMBAAECggEAAVl/QpmG3Gy8TFO81bA9jLqu+GkJ+cERRUdXZiXSraSa\nMKreKPAylI9XdWgehGOzmJgiXqt4Y7xCsRJRkhWcMJAVvZ/hormcKhj5QrdO8adk\nZDTTawRoXdYPTKn364rqIvwzPXIc8fSUB49JT3LFpFpimir+PyIWxefB0XSXpyP7\nEFO97pvHNVVVI9Tj8m5/TjF3sUbxexc4sXeVzssnnDpSv/W4CYc2AkBWucm6+uGB\n6lsoVqTAUgGBy98MIqJ1Y4f7TOYRRAS0v5TdZRGGcVYsYPJcNRqjC/zXiF3HxXyl\nZY3sz07J+FoNoGj1B2JnDEOIgOdFZr/C6kcN1K0nXQKBgQDaythnTO1RopojVddx\n6EGN22FoL8wAoXn99lBf/wnhHcnN+eykDxIFOT6xNYiNgLmdXoWHfwK7D/TaTTNw\n6Hgieb1E1A4JXDZ9nGKtIgHZImgkojQgrwwRTUJbYV2mbPUSAIz7Qt4LYx16z5dB\n9uMXTlC27HSVBweBcoArJ8HEKwKBgQDFH76yoM53sxEkQfApUfotOgD/DRNVZS1B\nog4um/eXmzMJWN1vIdzkaVPqRKmNNNUAvAHFjUGIBTWb0PcZitH4jlsWpVpxwlm6\nIhMO5bF3+H9UE+SnHn3ZLRqOq2KdJAexI1Df7fYxISIUwQqLO/kdUAimA/rrxRJD\nDXoPB8pAzwKBgE3iATCceKojqJzFdODOXW+C1WTCBut+j69wm+HgJoMlGG4i9jLc\nTnzfiMqKFObSGMDFIeE+vBkcr/t5mcMqbYFQNqiml6yLT7ZdEd8xiNjjX5ES0F2G\nElSiXOmseirBBGf5HDZg8iu5h4ftF5naqbHlJeRHvaRDEU/qE2fJSjdrAoGAbaKk\nS3FIpCaB6CqMSk7/19uk5jX9hMdLDm/1d1Ljt/xnvFEih0bMNnWmaGtb6d9ygIAQ\ndDGGOwK6uDjW1evxsE5stwGsdgzkHrQI6YYy2EjreHW//Hrm/70oQiVsKX36kTjV\nKFaPUO/eprBfDuWCPh1fUgZwrmTjLUv3kRiCEt0CgYEAv/hcz7V3oSOii7Hw61cn\ndLN0bErjpAV2my0tC7fCOWSmnUBsA8CqbWP8V5meggscV5BEG2iNiXOrsx8BrY6g\nExJHy3mywntGWrK3V82izNyEJC+1aFnRMhj49kGFtvTPSbGU6Re0T8MmAySTgmDS\ngFK6KqD7zhUtdFZ5gfqtMVw=\n-----END PRIVATE KEY-----\n"

if (!admin.apps.length) {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn(
      "Firebase admin not initialized: missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY"
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });
  }
}

export default admin;
export const firestore = admin.apps.length ? admin.firestore() : null;
export const messaging = admin.apps.length ? admin.messaging() : null;
