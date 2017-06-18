# Serverless contact

> Send contact mails using aws lambda

## AWS configuration

  * Validate sender email and domain in SES
  * Create an admin user for serverless framework
  * Create a S3 bucket and put an html mail template inside
  
## App configuration

```bash
cp .env.sample .env
```

Edit .env

  * SENDER_NAME: Name of the mail sender
  * SENDER_EMAIL: Email address of the mail sender
  * RECEIVER_EMAIL: Email where goes the contact info
  * TEMPLATE_BUCKET: S3 bucket it where are stored the templates
  * EMAIL_TEMPLATE: Object key of the template
  * EMAIL_SUBJECT: Subject of the email

## Deploy

```bash
serverless deploy
```

## Usage

```bash
curl -X POST \
  https://AWS_ENDPOINT/dev/contact \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
	"email": "gerard.baste@gmail.com",
	"name": "Gerard Baste",
	"data": {
		"message": "Trop gras!"
	}
}'
```