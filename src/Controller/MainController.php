<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MainController extends AbstractController
{
    #[Route('/')]
    public function index(): Response
    {
        return $this->render('main/index.html.twig');
    }
    #[Route('/grid')]
    public function grid(): Response
    {
        return $this->render('main/grid.html.twig');
    }
    #[Route('/kanban')]
    public function kanban(): Response
    {
        return $this->render('main/kanban.html.twig');
    }
    #[Route('/calendario')]
    public function calendario(): Response
    {
        return $this->render('main/calendario.html.twig');
    }
}
