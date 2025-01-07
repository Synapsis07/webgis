from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='homepage'), #home page
    path('about/', views.about, name='aboutus'),  # About page
    path('leaflet-map/', views.leaflet_map, name='leaflet_map'),
    path('weather/', views.weather, name='weather'),  # Weather app
    path('flight/', views.flighta, name='flight'),
    path('heatmap/', views.heat, name='heatmap'),
    path('technicaldocs/', views.docss, name='docs'),
    
]