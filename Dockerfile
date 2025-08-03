# Use a SageMath image as base
FROM sagemath/sagemath:latest

WORKDIR /app
COPY backend.py ./
RUN sage -pip install flask flask-cors

EXPOSE 5000
CMD ["sage", "-python", "backend.py"]