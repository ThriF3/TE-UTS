import cv2
import numpy as np


def otsu_thresholding(image_path: str, output_size=(300, 300)):
    original_image = cv2.imread(image_path)

    if original_image is None:
        return None, None

    # Sama seperti kode raw: BGR ke HSV/HSI versi OpenCV
    hsi_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2HSV)

    # Ambil channel intensity/value
    intensity_channel = hsi_image[:, :, 2]

    resized_original = cv2.resize(intensity_channel, output_size)

    hist = cv2.calcHist([intensity_channel], [0], None, [256], [0, 256])
    hist_norm = hist.ravel() / hist.sum()

    q = hist_norm.cumsum()
    bins = np.arange(256)

    threshold = -1
    max_sigma = -1

    for i in range(1, 256):
        p1, p2 = np.hsplit(hist_norm, [i])
        q1 = q[i]
        q2 = q[255] - q[i]

        if q1 == 0 or q2 == 0:
            continue

        b1 = np.sum(p1 * bins[:i]) / q1
        b2 = np.sum(p2 * bins[i:]) / q2
        sigma = q1 * q2 * ((b1 - b2) ** 2)

        if sigma > max_sigma:
            max_sigma = sigma
            threshold = i

    _, thresholded = cv2.threshold(
        intensity_channel,
        threshold,
        255,
        cv2.THRESH_BINARY
    )

    resized_thresholded = cv2.resize(thresholded, output_size)

    return resized_original, resized_thresholded


def detect_currency(image_path: str):
    image = cv2.imread(image_path)

    if image is None:
        return "Gambar Tidak Valid", 0

    # Sama seperti kode raw: deteksi blob pada grayscale,
    # BUKAN pada hasil Otsu.
    detector = cv2.SimpleBlobDetector_create()

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    keypoints = detector.detect(gray)

    if len(keypoints) > 0:
        result = "Uang Asli"
    else:
        result = "Uang Palsu"

    return result, len(keypoints)


def detect_authenticity(image_path: str):
    result, blob_count = detect_currency(image_path)

    return {
        "authenticity": result,
        "is_authentic": result == "Uang Asli",
        "blob_count": blob_count
    }