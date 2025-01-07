from django.shortcuts import render
from django.contrib import messages
import requests
import datetime


def weather(request):
    # Default city
    city = request.POST.get('city', 'pokhara')

    # OpenWeatherMap API setup
    weather_api_url = f'https://api.openweathermap.org/data/2.5/weather'
    weather_api_key = 'd7c062475b42a38f2ef0c5aa0e20a48a'
    weather_params = {'q': city, 'appid': weather_api_key, 'units': 'metric'}

    # Google Custom Search API setup
    google_api_key = 'AIzaSyCEQzRBUQLkBLhJQqooNxW0NqBBQiBPrNY'
    search_engine_id = 'c4fd004b16b3e4f26'
    query = f"{city} 1920x1080"
    start = 1
    search_type = 'image'
    google_search_url = (
        f"https://www.googleapis.com/customsearch/v1?"
        f"key={google_api_key}&cx={search_engine_id}&q={query}&start={start}&searchType={search_type}&imgSize=xlarge"
    )

    try:
        # Fetch weather data
        weather_response = requests.get(weather_api_url, params=weather_params).json()

        if weather_response.get('cod') != 200:
            # Capture error message from API response
            error_message = weather_response.get('message', 'City not found')
            raise KeyError(error_message)

        description = weather_response['weather'][0]['description']
        icon = weather_response['weather'][0]['icon']
        temp = weather_response['main']['temp']

        # Fetch image data
        image_response = requests.get(google_search_url).json()
        search_items = image_response.get('items', [])
        image_url = search_items[1]['link'] if len(search_items) > 1 else None

        # Render response
        return render(
            request,
            'weatherapp/weather.html',
            {
                'description': description,
                'icon': icon,
                'temp': temp,
                'day': datetime.date.today(),
                'city': city,
                'exception_occurred': False,
                'image_url': image_url,
            },
        )

    except KeyError as e:
        # Handle missing city data or API errors
        messages.error(request, f"Error: {str(e)}")

        return render(
            request,
            'weatherapp/weather.html',
            {
                'description': 'clear sky',
                'icon': '01d',
                'temp': 25,
                'day': datetime.date.today(),
                'city': city,
                'exception_occurred': True,
                'image_url': None,
            },
        )
    except Exception as e:
        messages.error(request, f"An unexpected error occurred: {str(e)}")
        return render(
            request,
            'weatherapp/weather.html',
            {
                'description': 'clear sky',
                'icon': '01d',
                'temp': 25,
                'day': datetime.date.today(),
                'city': 'Kathmandu',
                'exception_occurred': True,
                'image_url': None,
            },
        )
def about(request):
    return render(request, 'weatherapp/aboutus.html')
def leaflet_map(request):
    return render(request, 'weatherapp/leaflet_webmap.html')
def home(request):
    return render(request, 'weatherapp/homepage.html')
def heat(request):
    return render(request, 'weatherapp/heatmap.html')
def flighta(request):
    return render(request, 'weatherapp/flight.html')
def docss(request):
    return render(request, 'weatherapp/docs.html')
