# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

def process_image(image, text):
    # Read the image
    nparr = np.frombuffer(image.read(), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale for processing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply thresholding to create a binary image
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Assume the largest contour is the main subject
    main_contour = max(contours, key=cv2.contourArea)

    # Create a mask for the main subject
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    cv2.drawContours(mask, [main_contour], 0, (255), -1)

    # Invert the mask to get the background
    background_mask = cv2.bitwise_not(mask)

    # Add text to the background
    font = cv2.FONT_HERSHEY_SIMPLEX
    text_color = (255, 255, 255)  # White color
    text_thickness = 2
    text_size = cv2.getTextSize(text, font, 1, text_thickness)[0]

    # Calculate position to center the text
    text_x = (img.shape[1] - text_size[0]) // 2
    text_y = (img.shape[0] + text_size[1]) // 2

    cv2.putText(img, text, (text_x, text_y), font, 1, text_color, text_thickness)

    # Blend the text with the background
    text_mask = np.zeros_like(img)
    cv2.putText(text_mask, text, (text_x, text_y), font, 1, (255, 255, 255), text_thickness)
    text_mask = cv2.bitwise_and(text_mask, text_mask, mask=background_mask)

    # Combine the original image with the text
    result = cv2.add(img, text_mask)

    # Encode the result image to base64
    _, buffer = cv2.imencode('.jpg', result)
    result_base64 = base64.b64encode(buffer).decode('utf-8')

    return result_base64

@app.route('/process', methods=['POST'])
def process():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    image = request.files['image']
    text = request.form.get('text', '')

    result = process_image(image, text)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)